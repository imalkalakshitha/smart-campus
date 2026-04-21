package com.smartcampus.smart_campus.repository;

import com.smartcampus.smart_campus.model.EmergencyAlert;
import com.smartcampus.smart_campus.model.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, Long> {

    // Find all active alerts
    List<EmergencyAlert> findByStatus(AlertStatus status);

    // Find alerts by type
    List<EmergencyAlert> findByAlertType(String alertType);

    // Find alerts by severity
    List<EmergencyAlert> findBySeverity(String severity);
}