package com.campus.marketplace.controller;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.User;
import com.campus.marketplace.service.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @PostMapping
    public ResponseEntity<OfferResponse> createOffer(
            @Valid @RequestBody OfferRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(offerService.createOffer(request, user));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<OfferResponse>> getMySentOffers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(offerService.getMySentOffers(user));
    }

    @GetMapping("/received")
    public ResponseEntity<List<OfferResponse>> getReceivedOffers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(offerService.getReceivedOffers(user));
    }

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<List<OfferResponse>> getListingOffers(
            @PathVariable Long listingId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(offerService.getListingOffers(listingId, user));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OfferResponse> updateOfferStatus(
            @PathVariable Long id,
            @Valid @RequestBody OfferStatusRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(offerService.updateOfferStatus(id, request, user));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<OfferResponse> acceptOffer(
            @PathVariable Long id,
            @RequestBody(required = false) OfferStatusRequest request,
            @AuthenticationPrincipal User user) {
        OfferStatusRequest req = request != null ? request : new OfferStatusRequest();
        req.setStatus(com.campus.marketplace.entity.enums.OfferStatus.ACCEPTED);
        return ResponseEntity.ok(offerService.updateOfferStatus(id, req, user));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<OfferResponse> rejectOffer(
            @PathVariable Long id,
            @RequestBody(required = false) OfferStatusRequest request,
            @AuthenticationPrincipal User user) {
        OfferStatusRequest req = request != null ? request : new OfferStatusRequest();
        req.setStatus(com.campus.marketplace.entity.enums.OfferStatus.REJECTED);
        return ResponseEntity.ok(offerService.updateOfferStatus(id, req, user));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OfferResponse> cancelOffer(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        OfferStatusRequest req = new OfferStatusRequest();
        req.setStatus(com.campus.marketplace.entity.enums.OfferStatus.CANCELLED);
        return ResponseEntity.ok(offerService.updateOfferStatus(id, req, user));
    }

    @PatchMapping("/{id}/counter")
    public ResponseEntity<OfferResponse> counterOffer(
            @PathVariable Long id,
            @Valid @RequestBody CounterOfferRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(offerService.counterOffer(id, request, user));
    }
}
