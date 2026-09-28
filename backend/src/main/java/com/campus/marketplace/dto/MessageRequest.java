package com.campus.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MessageRequest {
    @NotNull(message = "Receiver ID is required")
    @com.fasterxml.jackson.annotation.JsonAlias({"recipientId", "receiverId"})
    private Long receiverId;

    @NotNull(message = "Listing ID is required")
    private Long listingId;

    @NotBlank(message = "Message content is required")
    private String content;
}
