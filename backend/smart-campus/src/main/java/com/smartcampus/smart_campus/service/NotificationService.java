package com.smartcampus.smart_campus.service;

import com.smartcampus.smart_campus.model.Notification;
import com.smartcampus.smart_campus.model.User;
import com.smartcampus.smart_campus.repository.NotificationRepository;
import com.smartcampus.smart_campus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void createNotification(User user, String title,
                                   String message, String type) {
        if (user != null) {
            // Send to specific user
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notificationRepository.save(notification);
        } else {
            // Broadcast to all users
            List<User> allUsers = userRepository.findAll();
            List<Notification> notifications = allUsers.stream()
                    .map(u -> {
                        Notification n = new Notification();
                        n.setUser(u);
                        n.setTitle(title);
                        n.setMessage(message);
                        n.setType(type);
                        return n;
                    }).toList();
            notificationRepository.saveAll(notifications);
        }
    }

    public List<Notification> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + userId));
        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        List<Notification> unread = notificationRepository
                .findByUserAndIsRead(user, false);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    public Long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        return notificationRepository
                .countByUserAndIsRead(user, false);
    }

    // ✅ Delete single notification
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    // ✅ Delete all notifications for user
    public void deleteAllNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        List<Notification> all = notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
        notificationRepository.deleteAll(all);
    }


}