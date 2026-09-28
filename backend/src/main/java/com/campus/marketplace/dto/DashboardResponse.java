package com.campus.marketplace.dto;

import lombok.*;
import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private long totalUsers;
    private long totalStudents;
    private long activeListings;
    private long pendingListings;
    private long soldListings;
    private long totalListings;
    private long pendingReports;
    private long totalReports;
    private long blockedUsers;
    private Map<String, Long> listingsByCategory;
    private long completedTransactions;
}
