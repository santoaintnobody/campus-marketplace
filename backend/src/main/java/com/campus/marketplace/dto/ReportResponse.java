package com.campus.marketplace.dto;

import com.campus.marketplace.entity.enums.ReportStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ReportResponse {
    private Long id;
    private Long reporterId;
    private String reporterName;
    private Long listingId;
    private String listingTitle;
    private Long reportedUserId;
    private String reportedUserName;
    private String reason;
    private String description;
    private ReportStatus status;
    private String adminNotes;
    private LocalDateTime createdAt;
}
