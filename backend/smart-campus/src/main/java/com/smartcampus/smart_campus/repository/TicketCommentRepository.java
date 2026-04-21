package com.smartcampus.smart_campus.repository;

import com.smartcampus.smart_campus.model.IncidentTicket;
import com.smartcampus.smart_campus.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicketOrderByCreatedAtAsc(IncidentTicket ticket);
}