package com.campus.marketplace.service;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.*;
import com.campus.marketplace.entity.enums.*;
import com.campus.marketplace.exception.*;
import com.campus.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final ReportRepository reportRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final ListingService listingService;

    public DashboardResponse getDashboard() {
        Map<String, Long> categoryMap = new LinkedHashMap<>();
        List<Object[]> categoryCounts = listingRepository.countByStatusGroupByCategory(ListingStatus.ACTIVE);
        for (Object[] row : categoryCounts) {
            categoryMap.put(((Category) row[0]).name(), (Long) row[1]);
        }

        return DashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalStudents(userRepository.countByRole(Role.STUDENT))
                .activeListings(listingRepository.countByStatus(ListingStatus.ACTIVE))
                .pendingListings(listingRepository.countByStatus(ListingStatus.PENDING_APPROVAL))
                .soldListings(listingRepository.countByStatus(ListingStatus.SOLD))
                .totalListings(listingRepository.count())
                .pendingReports(reportRepository.countByStatus(ReportStatus.PENDING))
                .totalReports(reportRepository.count())
                .blockedUsers(userRepository.countByAccountActive(false))
                .listingsByCategory(categoryMap)
                .completedTransactions(transactionRepository.countByStatus(TransactionStatus.COMPLETED))
                .build();
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUserResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> searchUsers(String query) {
        return userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query).stream()
                .map(this::mapUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApiResponse blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot block an admin");
        }

        user.setAccountActive(false);
        userRepository.save(user);

        notificationService.createNotification(user, NotificationType.USER_BLOCKED,
                "Account Blocked", "Your account has been blocked by admin. Please contact support.");

        return ApiResponse.success("User blocked successfully");
    }

    @Transactional
    public ApiResponse unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setAccountActive(true);
        userRepository.save(user);

        notificationService.createNotification(user, NotificationType.USER_UNBLOCKED,
                "Account Unblocked", "Your account has been unblocked. You can now use the marketplace.");

        return ApiResponse.success("User unblocked successfully");
    }

    public List<ListingResponse> getPendingListings() {
        return listingRepository.findAll().stream()
                .filter(l -> l.getStatus() == ListingStatus.PENDING_APPROVAL)
                .map(l -> listingService.mapToResponse(l, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public ListingResponse approveListing(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);

        notificationService.createNotification(listing.getSeller(), NotificationType.LISTING_APPROVED,
                "Listing Approved", "Your listing '" + listing.getTitle() + "' has been approved.",
                listing.getId());

        return listingService.mapToResponse(listing, null);
    }

    @Transactional
    public ListingResponse rejectListing(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        listing.setStatus(ListingStatus.REMOVED);
        listingRepository.save(listing);

        notificationService.createNotification(listing.getSeller(), NotificationType.LISTING_REJECTED,
                "Listing Rejected", "Your listing '" + listing.getTitle() + "' has been rejected by admin.",
                listing.getId());

        return listingService.mapToResponse(listing, null);
    }

    @Transactional
    public ApiResponse removeListing(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        listing.setStatus(ListingStatus.REMOVED);
        listingRepository.save(listing);

        notificationService.createNotification(listing.getSeller(), NotificationType.LISTING_REJECTED,
                "Listing Removed", "Your listing '" + listing.getTitle() + "' has been removed by admin.",
                listing.getId());

        return ApiResponse.success("Listing removed");
    }

    private UserResponse mapUserResponse(User user) {
        long listingCount = listingRepository.countBySeller(user);
        long soldCount = listingRepository.countBySellerAndStatus(user, ListingStatus.SOLD);

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .year(user.getYear())
                .studentId(user.getStudentId())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .accountActive(user.isAccountActive())
                .rating(user.getRating())
                .ratingCount(user.getRatingCount())
                .listingCount(listingCount)
                .soldCount(soldCount)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
