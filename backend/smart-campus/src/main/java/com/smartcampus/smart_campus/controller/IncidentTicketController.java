package com.smartcampus.smart_campus.controller;

import com.smartcampus.smart_campus.model.*;
import com.smartcampus.smart_campus.service.IncidentTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class IncidentTicketController {

    private final IncidentTicketService ticketService;

    // GET - සියලු tickets ගන්න
    @GetMapping
    public ResponseEntity<List<IncidentTicket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // GET - ID වලින් ticket ගන්න
    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicket> getTicket(
            @PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // GET - User tickets ගන්න
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<IncidentTicket>> getUserTickets(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                ticketService.getUserTickets(userId));
    }

    // POST - නව ticket create කරන්න
    @PostMapping
    public ResponseEntity<IncidentTicket> createTicket(
            @RequestBody IncidentTicket ticket) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(ticket));
    }

    // PUT - Ticket status update කරන්න
    @PutMapping("/{id}/status")
    public ResponseEntity<IncidentTicket> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        TicketStatus status = TicketStatus.valueOf(
                body.get("status"));
        String note = body.getOrDefault("note", "");
        return ResponseEntity.ok(
                ticketService.updateTicketStatus(id, status, note));
    }

    // PUT - Technician assign කරන්න
    @PutMapping("/{id}/assign/{technicianId}")
    public ResponseEntity<IncidentTicket> assignTechnician(
            @PathVariable Long id,
            @PathVariable Long technicianId) {
        return ResponseEntity.ok(
                ticketService.assignTechnician(id, technicianId));
    }

    // GET - Ticket comments ගන්න
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> getComments(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ticketService.getTicketComments(id));
    }

    // POST - Comment add කරන්න
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable Long id,
            @RequestBody TicketComment comment) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, comment));
    }

    // DELETE - Comment delete කරන්න ✅ NEW
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId) {
        ticketService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    // DELETE - Ticket delete කරන්න ✅ NEW
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // POST - Images upload කරන්න
    @PostMapping("/{id}/images")
    public ResponseEntity<List<String>> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files)
            throws IOException {
        return ResponseEntity.ok(
                ticketService.saveImageAttachments(id, files));
    }
}