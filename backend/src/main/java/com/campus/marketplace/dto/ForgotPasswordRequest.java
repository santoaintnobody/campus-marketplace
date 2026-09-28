package com.campus.marketplace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ForgotPasswordRequest {
    @NotBlank(message = "Email is required")
    private String email;
}
