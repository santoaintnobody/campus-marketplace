package com.campus.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ReportRequest {
    @NotNull(message = "Listing ID is required")
    private Long listingId;

    private Long reportedUserId;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String description;
}
