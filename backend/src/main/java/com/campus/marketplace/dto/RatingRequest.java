package com.campus.marketplace.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RatingRequest {
    @NotNull(message = "Reviewed user ID is required")
    private Long reviewedUserId;

    @NotNull(message = "Listing ID is required")
    private Long listingId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    private String review;
}
