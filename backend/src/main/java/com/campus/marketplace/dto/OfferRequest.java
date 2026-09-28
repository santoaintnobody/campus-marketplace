package com.campus.marketplace.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferRequest {

    @NotNull(message = "Listing ID is required")
    private Long listingId;

    @NotNull(message = "Offer amount is required")
    @DecimalMin(value = "1.0", message = "Offer amount must be greater than 0")
    private BigDecimal offerAmount;

    private String message;
}
