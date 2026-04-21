package com.smartcampus.smart_campus.controller;

import com.smartcampus.smart_campus.model.Booking;
import com.smartcampus.smart_campus.model.BookingStatus;
import com.smartcampus.smart_campus.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // GET - සියලු bookings ගන්න
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        if (status != null) {
            return ResponseEntity.ok(
                    bookingService.getBookingsByStatus(status));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // GET - ID වලින් booking ගන්න
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBooking(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                bookingService.getBookingById(id));
    }

    // GET - User bookings ගන්න
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                bookingService.getUserBookings(userId));
    }

    // POST - නව booking create කරන්න
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody Booking booking) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(booking));
    }

    // PUT - Booking approve කරන්න
    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String note = body.getOrDefault("note", "Approved");
        return ResponseEntity.ok(
                bookingService.approveBooking(id, note));
    }

    // PUT - Booking reject කරන්න
    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Rejected");
        return ResponseEntity.ok(
                bookingService.rejectBooking(id, reason));
    }

    // PUT - Booking cancel කරන්න
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                bookingService.cancelBooking(id));
    }

    // DELETE - Booking delete කරන්න ✅ NEW
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}