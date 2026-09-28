package com.campus.marketplace.dto;

import com.campus.marketplace.entity.enums.Category;
import com.campus.marketplace.entity.enums.ListingCondition;
import com.campus.marketplace.entity.enums.ListingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ListingResponse {
    private Long id;
    private UserResponse seller;
    private String title;
    private String description;
    private Category category;
    private BigDecimal price;
    private ListingCondition itemCondition;
    private ListingStatus status;
    private String location;
    private List<String> images;
    private boolean isFavorited;
    private long favoriteCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
