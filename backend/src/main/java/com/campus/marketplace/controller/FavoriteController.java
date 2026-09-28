package com.campus.marketplace.controller;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.User;
import com.campus.marketplace.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/favorites", "/api/wishlist"})
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<ListingResponse>> getFavorites(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(user));
    }

    @GetMapping("/count")
    public ResponseEntity<java.util.Map<String, Long>> getFavoritesCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(java.util.Map.of("count", favoriteService.getFavoritesCount(user)));
    }

    @GetMapping("/check/{listingId}")
    public ResponseEntity<java.util.Map<String, Boolean>> checkFavorite(
            @PathVariable Long listingId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(java.util.Map.of("wishlisted", favoriteService.isFavorite(listingId, user)));
    }

    @PostMapping("/toggle/{listingId}")
    public ResponseEntity<java.util.Map<String, Object>> toggleFavorite(
            @PathVariable Long listingId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(favoriteService.toggleFavorite(listingId, user));
    }

    @PostMapping("/{listingId}")
    public ResponseEntity<ApiResponse> addFavorite(@PathVariable Long listingId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(favoriteService.addFavorite(listingId, user));
    }

    @DeleteMapping("/{listingId}")
    public ResponseEntity<ApiResponse> removeFavorite(@PathVariable Long listingId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(favoriteService.removeFavorite(listingId, user));
    }
}
