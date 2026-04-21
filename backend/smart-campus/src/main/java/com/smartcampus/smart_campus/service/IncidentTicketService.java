package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.model.*;
import com.smartcampus.smart_campus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private final String uploadDir = "./uploads/tickets/";

    // Ticket create කරන්න
    public IncidentTicket createTicket(IncidentTicket ticket) {
        return ticketRepository.save(ticket);
    }

    // ID වලින් ticket ගන්න
    public IncidentTicket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found: " + id));
    }

    // සියලු tickets ගන්න
    public List<IncidentTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // User tickets ගන්න
    public List<IncidentTicket> getUserTickets(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        return ticketRepository.findByReportedBy(user);
    }

    // Ticket status update කරන්න
    public IncidentTicket updateTicketStatus(Long id,
                                             TicketStatus status, String note) {
        IncidentTicket ticket = getTicketById(id);
        ticket.setStatus(status);
        if (status == TicketStatus.RESOLVED) {
            ticket.setResolutionNote(note);
            ticket.setResolvedAt(LocalDateTime.now());
        }
        if (status == TicketStatus.REJECTED) {
            ticket.setRejectionReason(note);
        }
        IncidentTicket saved = ticketRepository.save(ticket);
        notificationService.createNotification(
                ticket.getReportedBy(),
                "Ticket Status Updated",
                "Your ticket #" + id + " status changed to: "
                        + status,
                "TICKET"
        );
        return saved;
    }

    // Technician assign කරන්න
    public IncidentTicket assignTechnician(Long ticketId,
                                           Long technicianId) {
        IncidentTicket ticket = getTicketById(ticketId);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() ->
                        new RuntimeException("Technician not found"));
        ticket.setAssignedTo(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        return ticketRepository.save(ticket);
    }

    // Comment add කරන්න
    public TicketComment addComment(Long ticketId,
                                    TicketComment comment) {
        IncidentTicket ticket = getTicketById(ticketId);
        comment.setTicket(ticket);
        TicketComment saved = commentRepository.save(comment);
        notificationService.createNotification(
                ticket.getReportedBy(),
                "New Comment on Ticket #" + ticketId,
                "Someone added a comment on your ticket.",
                "COMMENT"
        );
        return saved;
    }

    // Comments ගන්න
    public List<TicketComment> getTicketComments(Long ticketId) {
        IncidentTicket ticket = getTicketById(ticketId);
        return commentRepository
                .findByTicketOrderByCreatedAtAsc(ticket);
    }

    // Comment delete කරන්න ✅ NEW
    public void deleteComment(Long commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new RuntimeException(
                    "Comment not found: " + commentId);
        }
        commentRepository.deleteById(commentId);
    }

    // Ticket delete කරන්න ✅ NEW
    public void deleteTicket(Long id) {
        IncidentTicket ticket = getTicketById(id);
        // Comments delete කරන්න
        List<TicketComment> comments =
                commentRepository.findByTicketOrderByCreatedAtAsc(ticket);
        commentRepository.deleteAll(comments);
        // Ticket delete කරන්න
        ticketRepository.deleteById(id);
    }

    // Images upload කරන්න
    public List<String> saveImageAttachments(Long ticketId,
                                             List<MultipartFile> files) throws IOException {
        if (files.size() > 3) {
            throw new RuntimeException(
                    "Maximum 3 images allowed!");
        }
        IncidentTicket ticket = getTicketById(ticketId);
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        List<String> imagePaths = new ArrayList<>();
        for (MultipartFile file : files) {
            String filename = ticketId + "_"
                    + System.currentTimeMillis() + "_"
                    + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath,
                    StandardCopyOption.REPLACE_EXISTING);
            imagePaths.add(uploadDir + filename);
        }
        ticket.setImagePaths(imagePaths);
        ticketRepository.save(ticket);
        return imagePaths;
    }
}