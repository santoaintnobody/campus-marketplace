package com.campus.marketplace.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConversationResponse {
    private Long otherUserId;
    private String otherUserName;
    private String otherUserProfileImage;
    private Long listingId;
    private String listingTitle;
    private String listingImage;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private long unreadCount;
}
