package com.smartcampus.smart_campus.repository;

import com.smartcampus.smart_campus.model.IncidentTicket;
import com.smartcampus.smart_campus.model.Resource;
import com.smartcampus.smart_campus.model.TicketPriority;
import com.smartcampus.smart_campus.model.TicketStatus;
import com.smartcampus.smart_campus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentTicketRepository
        extends JpaRepository<IncidentTicket, Long> {
    List<IncidentTicket> findByReportedBy(User user);
    List<IncidentTicket> findByAssignedTo(User user);
    List<IncidentTicket> findByStatus(TicketStatus status);
    List<IncidentTicket> findByPriority(TicketPriority priority);
    List<IncidentTicket> findByResource(Resource resource);
}