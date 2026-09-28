package com.campus.marketplace.repository;

import com.campus.marketplace.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Favorite> findByUserIdAndListingId(Long userId, Long listingId);
    boolean existsByUserIdAndListingId(Long userId, Long listingId);
    void deleteByUserIdAndListingId(Long userId, Long listingId);
    long countByUserId(Long userId);
    long countByListingId(Long listingId);
}
