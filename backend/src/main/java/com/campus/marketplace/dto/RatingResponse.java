package com.campus.marketplace.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RatingResponse {
    private Long id;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerProfileImage;
    private Long reviewedUserId;
    private String reviewedUserName;
    private Long listingId;
    private String listingTitle;
    private Integer rating;
    private String review;
    private LocalDateTime createdAt;
}
