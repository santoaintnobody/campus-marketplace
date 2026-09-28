package com.campus.marketplace.dto;

import com.campus.marketplace.entity.enums.OfferStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferStatusRequest {

    @NotNull(message = "Status is required")
    private OfferStatus status;

    private String message;
}
