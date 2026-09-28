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
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ListingRepository listingRepository;
    private final ListingService listingService;

    @Transactional
    public ApiResponse addFavorite(Long listingId, User user) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (favoriteRepository.existsByUserIdAndListingId(user.getId(), listingId)) {
            throw new DuplicateResourceException("Listing is already in your favorites");
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .listing(listing)
                .build();
        favoriteRepository.save(favorite);

        return ApiResponse.success("Added to favorites");
    }

    @Transactional
    public ApiResponse removeFavorite(Long listingId, User user) {
        if (!favoriteRepository.existsByUserIdAndListingId(user.getId(), listingId)) {
            throw new ResourceNotFoundException("Listing is not in your favorites");
        }
        favoriteRepository.deleteByUserIdAndListingId(user.getId(), listingId);
        return ApiResponse.success("Removed from favorites");
    }

    public List<ListingResponse> getUserFavorites(User user) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(fav -> listingService.mapToResponse(fav.getListing(), user.getId()))
                .collect(Collectors.toList());
    }

    public long getFavoritesCount(User user) {
        return favoriteRepository.countByUserId(user.getId());
    }

    @Transactional
    public java.util.Map<String, Object> toggleFavorite(Long listingId, User user) {
        boolean isFav = favoriteRepository.existsByUserIdAndListingId(user.getId(), listingId);
        if (isFav) {
            favoriteRepository.deleteByUserIdAndListingId(user.getId(), listingId);
            long count = favoriteRepository.countByUserId(user.getId());
            return java.util.Map.of("favorited", false, "wishlisted", false, "count", count, "message", "Removed from wishlist");
        } else {
            Listing listing = listingRepository.findById(listingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
            Favorite favorite = Favorite.builder()
                    .user(user)
                    .listing(listing)
                    .build();
            favoriteRepository.save(favorite);
            long count = favoriteRepository.countByUserId(user.getId());
            return java.util.Map.of("favorited", true, "wishlisted", true, "count", count, "message", "Added to wishlist");
        }
    }

    public boolean isFavorite(Long listingId, User user) {
        return favoriteRepository.existsByUserIdAndListingId(user.getId(), listingId);
    }
}
