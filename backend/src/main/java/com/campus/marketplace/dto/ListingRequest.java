package com.campus.marketplace.dto;

import com.campus.marketplace.entity.enums.Category;
import com.campus.marketplace.entity.enums.ListingCondition;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ListingRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private Category category;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Condition is required")
    private ListingCondition itemCondition;

    private String location;
}
