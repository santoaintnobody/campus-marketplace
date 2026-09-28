package com.campus.marketplace.dto;

import com.campus.marketplace.entity.enums.Role;
import lombok.*;

import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String department;
    private String year;
    private String studentId;
    private String profileImage;
    private Role role;
    private boolean emailVerified;
    private boolean accountActive;
    private Double rating;
    private Integer ratingCount;
    private Long listingCount;
    private Long soldCount;
    private LocalDateTime createdAt;
}
