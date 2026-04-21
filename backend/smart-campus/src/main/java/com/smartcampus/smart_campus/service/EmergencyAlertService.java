package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.model.*;
import com.smartcampus.smart_campus.repository.EmergencyAlertRepository;
import com.smartcampus.smart_campus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmergencyAlertService {

    private final EmergencyAlertRepository alertRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Create new alert
    public EmergencyAlert createAlert(EmergencyAlert alert) {
        return alertRepository.save(alert);
    }

    // Get all alerts
    public List<EmergencyAlert> getAllAlerts() {
        return alertRepository.findAll();
    }

    // Get alert by ID
    public EmergencyAlert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Alert not found: " + id));
    }

    // Get active alerts only
    public List<EmergencyAlert> getActiveAlerts() {
        return alertRepository.findByStatus(AlertStatus.ACTIVE);
    }

    // Update alert
    public EmergencyAlert updateAlert(Long id, EmergencyAlert updatedAlert) {
        EmergencyAlert alert = getAlertById(id);
        alert.setTitle(updatedAlert.getTitle());
        alert.setMessage(updatedAlert.getMessage());
        alert.setAlertType(updatedAlert.getAlertType());
        alert.setSeverity(updatedAlert.getSeverity());
        return alertRepository.save(alert);
    }

    // Resolve alert
    public EmergencyAlert resolveAlert(Long id, String resolvedNote) {
        EmergencyAlert alert = getAlertById(id);
        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedNote(resolvedNote);

        EmergencyAlert saved = alertRepository.save(alert);

        // Send notification to all users
        notificationService.createNotification(
                null, // null means broadcast to all users
                "Emergency Alert Resolved",
                "Alert '" + alert.getTitle() + "' has been resolved.",
                "ALERT"
        );

        return saved;
    }

    // Delete alert
    public void deleteAlert(Long id) {
        EmergencyAlert alert = getAlertById(id);
        alertRepository.deleteById(id);
    }
}