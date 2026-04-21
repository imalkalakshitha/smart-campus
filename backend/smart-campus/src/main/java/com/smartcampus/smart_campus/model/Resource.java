package com.smartcampus.smart_campus.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Resource name is required")
    @Size(min = 2, max = 100,
            message = "Name must be between 2-100 characters")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Resource type is required")
    @Enumerated(EnumType.STRING)
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 1000, message = "Capacity cannot exceed 1000")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location max 200 characters")
    private String location;

    private LocalTime availableFrom;
    private LocalTime availableTo;

    @Enumerated(EnumType.STRING)
    private ResourceStatus status;

    @Size(max = 500, message = "Description max 500 characters")
    private String description;

    @PrePersist
    public void prePersist() {
        if (status == null) status = ResourceStatus.ACTIVE;
    }
}