package com.smartcampus.smart_campus.repository;

import com.smartcampus.smart_campus.model.Resource;
import com.smartcampus.smart_campus.model.ResourceStatus;
import com.smartcampus.smart_campus.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByLocationContaining(String location);
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
}