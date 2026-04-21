package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.model.Booking;
import com.smartcampus.smart_campus.model.IncidentTicket;
import com.smartcampus.smart_campus.model.Resource;
import com.smartcampus.smart_campus.model.ResourceStatus;
import com.smartcampus.smart_campus.model.ResourceType;
import com.smartcampus.smart_campus.repository.BookingRepository;
import com.smartcampus.smart_campus.repository.IncidentTicketRepository;
import com.smartcampus.smart_campus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final IncidentTicketRepository ticketRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Resource not found: " + id));
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource updated) {
        Resource existing = getResourceById(id);
        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setCapacity(updated.getCapacity());
        existing.setLocation(updated.getLocation());
        existing.setStatus(updated.getStatus());
        existing.setDescription(updated.getDescription());
        existing.setAvailableFrom(updated.getAvailableFrom());
        existing.setAvailableTo(updated.getAvailableTo());
        return resourceRepository.save(existing);
    }

    @Transactional
    public void deleteResource(Long id) {
        Resource resource = getResourceById(id);

        // Related bookings delete කරන්න
        List<Booking> bookings =
                bookingRepository.findByResource(resource);
        bookingRepository.deleteAll(bookings);

        // Related tickets delete කරන්න
        List<IncidentTicket> tickets =
                ticketRepository.findByResource(resource);
        ticketRepository.deleteAll(tickets);

        // Resource delete කරන්න
        resourceRepository.deleteById(id);
    }

    public List<Resource> getByType(ResourceType type) {
        return resourceRepository.findByType(type);
    }

    public List<Resource> getByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status);
    }

    public List<Resource> searchByLocation(String location) {
        return resourceRepository.findByLocationContaining(location);
    }
}