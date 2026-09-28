package com.campus.marketplace.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounterOfferRequest {

    @NotNull(message = "Counter offer amount is required")
    @DecimalMin(value = "1.0", message = "Counter offer amount must be greater than 0")
    private BigDecimal counterAmount;

    private String message;
}
