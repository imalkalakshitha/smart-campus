package com.smartcampus.smart_campus.repository;

import com.smartcampus.smart_campus.model.Notification;
import com.smartcampus.smart_campus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndIsRead(User user, Boolean isRead);
    Long countByUserAndIsRead(User user, Boolean isRead);
}