package com.smartcampus.smart_campus.controller;

import com.smartcampus.smart_campus.model.EmergencyAlert;
import com.smartcampus.smart_campus.service.EmergencyAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class EmergencyAlertController {

    private final EmergencyAlertService alertService;

    // GET - සියලු alerts ගන්න
    @GetMapping
    public ResponseEntity<List<EmergencyAlert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    // GET - Alert එකක් ගන්න
    @GetMapping("/{id}")
    public ResponseEntity<EmergencyAlert> getAlert(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    // GET - Active alerts පමණක් ගන්න
    @GetMapping("/active")
    public ResponseEntity<List<EmergencyAlert>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }

    // POST - නව alert create කරන්න
    @PostMapping
    public ResponseEntity<EmergencyAlert> createAlert(@RequestBody EmergencyAlert alert) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(alertService.createAlert(alert));
    }

    // PUT - Alert update කරන්න
    @PutMapping("/{id}")
    public ResponseEntity<EmergencyAlert> updateAlert(
            @PathVariable Long id,
            @RequestBody EmergencyAlert updatedAlert) {
        return ResponseEntity.ok(alertService.updateAlert(id, updatedAlert));
    }

    // PUT - Alert resolve කරන්න
    @PutMapping("/{id}/resolve")
    public ResponseEntity<EmergencyAlert> resolveAlert(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String resolvedNote = body.getOrDefault("resolvedNote", "");
        return ResponseEntity.ok(alertService.resolveAlert(id, resolvedNote));
    }

    // DELETE - Alert delete කරන්න
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        alertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }
}