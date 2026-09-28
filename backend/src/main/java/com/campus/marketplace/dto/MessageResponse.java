package com.campus.marketplace.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderProfileImage;
    private Long receiverId;
    private String receiverName;
    private Long listingId;
    private String listingTitle;
    private String content;
    private boolean isRead;
    private LocalDateTime timestamp;
}
