package com.campus.marketplace.controller;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.User;
import com.campus.marketplace.entity.enums.Category;
import com.campus.marketplace.entity.enums.ListingCondition;
import com.campus.marketplace.entity.enums.ListingStatus;
import com.campus.marketplace.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/listings", "/api/products"})
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @GetMapping
    public ResponseEntity<Page<ListingResponse>> getListings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) ListingCondition condition,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size,
            @AuthenticationPrincipal User currentUser) {
        String query = (search != null && !search.trim().isEmpty()) ? search : q;
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(listingService.searchListings(query, category, condition,
                location, minPrice, maxPrice, sort, page, size, userId));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ListingResponse>> getFeaturedListings(@AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(listingService.getFeaturedListings(userId));
    }

    @GetMapping("/stats")
    public ResponseEntity<PublicStatsResponse> getPublicStats() {
        return ResponseEntity.ok(listingService.getPublicStats());
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<List<ListingResponse>> getSimilarListings(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(listingService.getSimilarListings(id, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListing(@PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(listingService.getListingById(id, userId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListingResponse> createListing(
            @RequestPart("listing") @Valid ListingRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(listingService.createListing(request, images, user));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable Long id,
            @RequestPart("listing") @Valid ListingRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(listingService.updateListing(id, request, images, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteListing(@PathVariable Long id,
            @AuthenticationPrincipal User user) {
        listingService.deleteListing(id, user);
        return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ListingResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        ListingStatus status = ListingStatus.valueOf((String) body.get("status"));
        Long buyerId = body.get("buyerId") != null ? Long.valueOf(body.get("buyerId").toString()) : null;
        return ResponseEntity.ok(listingService.updateListingStatus(id, status, buyerId, user));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ListingResponse>> getMyListings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(listingService.getMyListings(user));
    }

    @GetMapping("/my/sold")
    public ResponseEntity<List<ListingResponse>> getMySoldListings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(listingService.getMySoldListings(user));
    }
}
