package com.smartcampus.smart_campus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "emergency_alerts")
public class EmergencyAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status = AlertStatus.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    @Column(columnDefinition = "TEXT")
    private String resolvedNote;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    // Explicit getters/setters added to avoid relying on Lombok at compile time
    public String getTitle() { return this.title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return this.message; }
    public void setMessage(String message) { this.message = message; }

    public AlertType getAlertType() { return this.alertType; }
    public void setAlertType(AlertType alertType) { this.alertType = alertType; }

    public AlertSeverity getSeverity() { return this.severity; }
    public void setSeverity(AlertSeverity severity) { this.severity = severity; }

    public AlertStatus getStatus() { return this.status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public LocalDateTime getResolvedAt() { return this.resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getResolvedNote() { return this.resolvedNote; }
    public void setResolvedNote(String resolvedNote) { this.resolvedNote = resolvedNote; }
}
