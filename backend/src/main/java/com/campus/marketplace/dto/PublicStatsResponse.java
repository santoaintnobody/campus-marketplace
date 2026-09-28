package com.campus.marketplace.dto;

import lombok.*;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicStatsResponse {

    private long totalStudents;
    private long totalListings;
    private long activeListings;
    private long totalCategories;
    private long completedExchanges;
    private Map<String, Long> listingsByCategory;
}
