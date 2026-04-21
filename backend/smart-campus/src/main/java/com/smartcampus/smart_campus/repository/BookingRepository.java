package com.smartcampus.smart_campus.repository;

import com.smartcampus.smart_campus.model.Booking;
import com.smartcampus.smart_campus.model.BookingStatus;
import com.smartcampus.smart_campus.model.Resource;
import com.smartcampus.smart_campus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    List<Booking> findByResource(Resource resource);
    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.resource = :resource " +
            "AND b.bookingDate = :date " +
            "AND b.status = 'APPROVED' " +
            "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    List<Booking> findConflictingBookings(
            @Param("resource") Resource resource,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );
}