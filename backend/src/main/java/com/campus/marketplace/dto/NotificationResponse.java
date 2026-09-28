package com.campus.marketplace.dto;

import com.campus.marketplace.entity.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private boolean isRead;
    private Long referenceId;
    private LocalDateTime createdAt;
}
