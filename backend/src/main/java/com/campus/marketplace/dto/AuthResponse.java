package com.campus.marketplace.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private UserResponse user;
}
