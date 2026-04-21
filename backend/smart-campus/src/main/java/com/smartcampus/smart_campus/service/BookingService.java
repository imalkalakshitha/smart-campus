package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.model.*;
import com.smartcampus.smart_campus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    // සියලු bookings ගන්න
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ID වලින් booking ගන්න
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found: " + id));
    }

    // User bookings ගන්න
    public List<Booking> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        return bookingRepository.findByUser(user);
    }

    // නව booking create කරන්න
    public Booking createBooking(Booking booking) {
        // Start time before end time check
        if (booking.getStartTime().isAfter(booking.getEndTime()) ||
                booking.getStartTime().equals(booking.getEndTime())) {
            throw new RuntimeException(
                    "Start time must be before end time!");
        }

        // Minimum 30 minutes check
        if (booking.getStartTime().plusMinutes(30)
                .isAfter(booking.getEndTime())) {
            throw new RuntimeException(
                    "Minimum booking duration is 30 minutes!");
        }

        // Conflict check
        List<Booking> conflicts = bookingRepository
                .findConflictingBookings(
                        booking.getResource(),
                        booking.getBookingDate(),
                        booking.getStartTime(),
                        booking.getEndTime()
                );
        if (!conflicts.isEmpty()) {
            throw new RuntimeException(
                    "Resource already booked for this time slot!");
        }
        return bookingRepository.save(booking);
    }

    // Booking approve කරන්න
    public Booking approveBooking(Long id, String note) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminNote(note);
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(
                booking.getUser(),
                "Booking Approved!",
                "Your booking for " + booking.getResource().getName()
                        + " has been approved.",
                "BOOKING"
        );
        return saved;
    }

    // Booking reject කරන්න
    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminNote(reason);
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(
                booking.getUser(),
                "Booking Rejected",
                "Your booking for " + booking.getResource().getName()
                        + " was rejected. Reason: " + reason,
                "BOOKING"
        );
        return saved;
    }

    // Booking cancel කරන්න
    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    // Status වලින් filter කරන්න
    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    // Booking delete කරන්න ✅ NEW
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found: " + id);
        }
        bookingRepository.deleteById(id);
    }
}