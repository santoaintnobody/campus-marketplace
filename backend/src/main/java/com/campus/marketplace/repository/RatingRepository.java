package com.campus.marketplace.repository;

import com.campus.marketplace.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByReviewedUserIdOrderByCreatedAtDesc(Long userId);
    List<Rating> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId);
    Optional<Rating> findByReviewerIdAndReviewedUserIdAndListingId(Long reviewerId, Long reviewedUserId, Long listingId);
    boolean existsByReviewerIdAndReviewedUserIdAndListingId(Long reviewerId, Long reviewedUserId, Long listingId);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.reviewedUser.id = :userId")
    Double getAverageRatingByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.reviewedUser.id = :userId")
    long countByReviewedUserId(@Param("userId") Long userId);
}
