package com.campus.marketplace.service;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.*;
import com.campus.marketplace.entity.enums.*;
import com.campus.marketplace.exception.*;
import com.campus.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    @Transactional
    public RatingResponse createRating(RatingRequest request, User reviewer) {
        // Cannot rate yourself
        if (reviewer.getId().equals(request.getReviewedUserId())) {
            throw new BadRequestException("You cannot rate yourself");
        }

        User reviewedUser = userRepository.findById(request.getReviewedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        // Verify transaction exists and is completed
        boolean isValidTransaction = false;
        if (listing.getStatus() == ListingStatus.SOLD) {
            // Check if reviewer is buyer or seller in the transaction
            Transaction transaction = transactionRepository.findByListingId(listing.getId()).orElse(null);
            if (transaction != null && transaction.getStatus() == TransactionStatus.COMPLETED) {
                isValidTransaction = (transaction.getBuyer().getId().equals(reviewer.getId()) &&
                        transaction.getSeller().getId().equals(request.getReviewedUserId())) ||
                        (transaction.getSeller().getId().equals(reviewer.getId()) &&
                        transaction.getBuyer().getId().equals(request.getReviewedUserId()));
            }
        }

        if (!isValidTransaction) {
            throw new BadRequestException("You can only rate users after a completed transaction");
        }

        // Check for duplicate rating
        if (ratingRepository.existsByReviewerIdAndReviewedUserIdAndListingId(
                reviewer.getId(), request.getReviewedUserId(), request.getListingId())) {
            throw new DuplicateResourceException("You have already rated this user for this transaction");
        }

        Rating rating = Rating.builder()
                .reviewer(reviewer)
                .reviewedUser(reviewedUser)
                .listing(listing)
                .rating(request.getRating())
                .review(request.getReview())
                .build();

        rating = ratingRepository.save(rating);

        // Update user's average rating
        Double avgRating = ratingRepository.getAverageRatingByUserId(reviewedUser.getId());
        long ratingCount = ratingRepository.countByReviewedUserId(reviewedUser.getId());
        reviewedUser.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        reviewedUser.setRatingCount((int) ratingCount);
        userRepository.save(reviewedUser);

        notificationService.createNotification(reviewedUser, NotificationType.RATING_RECEIVED,
                "New Rating Received",
                reviewer.getFullName() + " rated you " + request.getRating() + " stars for '" + listing.getTitle() + "'",
                listing.getId());

        return mapToResponse(rating);
    }

    public List<RatingResponse> getUserRatings(Long userId) {
        return ratingRepository.findByReviewedUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private RatingResponse mapToResponse(Rating r) {
        return RatingResponse.builder()
                .id(r.getId())
                .reviewerId(r.getReviewer().getId())
                .reviewerName(r.getReviewer().getFullName())
                .reviewerProfileImage(r.getReviewer().getProfileImage())
                .reviewedUserId(r.getReviewedUser().getId())
                .reviewedUserName(r.getReviewedUser().getFullName())
                .listingId(r.getListing().getId())
                .listingTitle(r.getListing().getTitle())
                .rating(r.getRating())
                .review(r.getReview())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
