package com.campus.marketplace.service;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.*;
import com.campus.marketplace.entity.enums.*;
import com.campus.marketplace.exception.*;
import com.campus.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final ListingRepository listingRepository;
    private final NotificationService notificationService;
    private final TransactionRepository transactionRepository;

    @Transactional
    public OfferResponse createOffer(OfferRequest request, User buyer) {
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (listing.getSeller().getId().equals(buyer.getId())) {
            throw new BadRequestException("You cannot make an offer on your own listing");
        }

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new BadRequestException("You can only make offers on active listings");
        }

        Offer offer = Offer.builder()
                .listing(listing)
                .buyer(buyer)
                .seller(listing.getSeller())
                .offerAmount(request.getOfferAmount())
                .message(request.getMessage())
                .status(OfferStatus.PENDING)
                .build();

        offer = offerRepository.save(offer);

        notificationService.createNotification(
                listing.getSeller(),
                NotificationType.OFFER_RECEIVED,
                "New Offer Received",
                buyer.getFullName() + " made an offer of ₹" + request.getOfferAmount() + " for '" + listing.getTitle() + "'",
                listing.getId()
        );

        return mapToResponse(offer);
    }

    public List<OfferResponse> getMySentOffers(User buyer) {
        return offerRepository.findByBuyerOrderByCreatedAtDesc(buyer).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OfferResponse> getReceivedOffers(User seller) {
        return offerRepository.findBySellerOrderByCreatedAtDesc(seller).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OfferResponse> getListingOffers(Long listingId, User user) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getSeller().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only the seller can view all offers for this listing");
        }

        return offerRepository.findByListingIdOrderByCreatedAtDesc(listingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OfferResponse updateOfferStatus(Long offerId, OfferStatusRequest request, User user) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        OfferStatus newStatus = request.getStatus();

        if (offer.getStatus() == OfferStatus.ACCEPTED && newStatus == OfferStatus.ACCEPTED) {
            throw new BadRequestException("Offer has already been accepted");
        }
        if (offer.getStatus() == OfferStatus.CANCELLED) {
            throw new BadRequestException("Cannot modify a cancelled offer");
        }

        if (newStatus == OfferStatus.ACCEPTED || newStatus == OfferStatus.REJECTED) {
            if (!offer.getSeller().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
                throw new ForbiddenException("Only the seller can accept or reject this offer");
            }
        } else if (newStatus == OfferStatus.CANCELLED) {
            if (!offer.getBuyer().getId().equals(user.getId())) {
                throw new ForbiddenException("Only the buyer can cancel this offer");
            }
        }

        offer.setStatus(newStatus);
        if (request.getMessage() != null && !request.getMessage().trim().isEmpty()) {
            offer.setMessage(request.getMessage());
        }
        offer = offerRepository.save(offer);

        if (newStatus == OfferStatus.ACCEPTED) {
            BigDecimal agreedAmount = offer.getCounterAmount() != null ? offer.getCounterAmount() : offer.getOfferAmount();
            
            // Create Transaction record for Deal completion tracking
            Transaction transaction = Transaction.builder()
                    .listing(offer.getListing())
                    .buyer(offer.getBuyer())
                    .seller(offer.getSeller())
                    .amount(agreedAmount)
                    .status(TransactionStatus.PENDING)
                    .build();
            transactionRepository.save(transaction);

            notificationService.createNotification(
                    offer.getBuyer(),
                    NotificationType.OFFER_ACCEPTED,
                    "Offer Accepted! 🎉",
                    "Your offer of ₹" + agreedAmount
                            + " for '" + offer.getListing().getTitle() + "' was accepted!",
                    offer.getListing().getId()
            );
        } else if (newStatus == OfferStatus.REJECTED) {
            notificationService.createNotification(
                    offer.getBuyer(),
                    NotificationType.OFFER_REJECTED,
                    "Offer Declined",
                    "Your offer for '" + offer.getListing().getTitle() + "' was declined by the seller.",
                    offer.getListing().getId()
            );
        }

        return mapToResponse(offer);
    }

    @Transactional
    public OfferResponse counterOffer(Long offerId, CounterOfferRequest request, User seller) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        if (offer.getStatus() != OfferStatus.PENDING && offer.getStatus() != OfferStatus.COUNTERED) {
            throw new BadRequestException("Can only counter a pending offer");
        }

        if (!offer.getSeller().getId().equals(seller.getId()) && seller.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only the seller can make a counter offer");
        }

        offer.setCounterAmount(request.getCounterAmount());
        offer.setStatus(OfferStatus.COUNTERED);
        if (request.getMessage() != null && !request.getMessage().trim().isEmpty()) {
            offer.setMessage(request.getMessage());
        }
        offer = offerRepository.save(offer);

        notificationService.createNotification(
                offer.getBuyer(),
                NotificationType.OFFER_COUNTERED,
                "Counter Offer Received",
                seller.getFullName() + " made a counter offer of ₹" + request.getCounterAmount()
                        + " for '" + offer.getListing().getTitle() + "'",
                offer.getListing().getId()
        );

        return mapToResponse(offer);
    }

    public OfferResponse mapToResponse(Offer offer) {
        String listingImage = null;
        if (offer.getListing().getImages() != null && !offer.getListing().getImages().isEmpty()) {
            listingImage = offer.getListing().getImages().stream()
                    .min(Comparator.comparingInt(ListingImage::getDisplayOrder))
                    .map(img -> "/uploads/" + img.getImageUrl())
                    .orElse(null);
        }

        return OfferResponse.builder()
                .id(offer.getId())
                .listingId(offer.getListing().getId())
                .listingTitle(offer.getListing().getTitle())
                .listingPrice(offer.getListing().getPrice())
                .listingImage(listingImage)
                .buyerId(offer.getBuyer().getId())
                .buyerName(offer.getBuyer().getFullName())
                .buyerEmail(offer.getBuyer().getEmail())
                .sellerId(offer.getSeller().getId())
                .sellerName(offer.getSeller().getFullName())
                .offerAmount(offer.getOfferAmount())
                .counterAmount(offer.getCounterAmount())
                .message(offer.getMessage())
                .status(offer.getStatus())
                .createdAt(offer.getCreatedAt())
                .updatedAt(offer.getUpdatedAt())
                .build();
    }
}
