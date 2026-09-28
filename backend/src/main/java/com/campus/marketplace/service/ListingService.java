package com.campus.marketplace.service;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.*;
import com.campus.marketplace.entity.enums.*;
import com.campus.marketplace.exception.*;
import com.campus.marketplace.repository.*;
import com.campus.marketplace.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final ListingImageRepository listingImageRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final FileUploadUtil fileUploadUtil;
    private final NotificationService notificationService;
    private final TransactionRepository transactionRepository;

    @Value("${app.listing.require-approval}")
    private boolean requireApproval;

    @Transactional
    public ListingResponse createListing(ListingRequest request, List<MultipartFile> images, User seller) {
        Listing listing = Listing.builder()
                .seller(seller)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .itemCondition(request.getItemCondition())
                .status(requireApproval ? ListingStatus.PENDING_APPROVAL : ListingStatus.ACTIVE)
                .location(request.getLocation())
                .images(new ArrayList<>())
                .build();

        listing = listingRepository.save(listing);

        if (images != null && !images.isEmpty()) {
            int order = 0;
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    String filename = fileUploadUtil.uploadFile(image);
                    ListingImage listingImage = ListingImage.builder()
                            .listing(listing)
                            .imageUrl(filename)
                            .displayOrder(order++)
                            .build();
                    listing.getImages().add(listingImage);
                }
            }
            listing = listingRepository.save(listing);
        }

        return mapToResponse(listing, seller.getId());
    }

    @Transactional
    public ListingResponse updateListing(Long id, ListingRequest request, List<MultipartFile> newImages, User user) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getSeller().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only edit your own listings");
        }

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setCategory(request.getCategory());
        listing.setPrice(request.getPrice());
        listing.setItemCondition(request.getItemCondition());
        listing.setLocation(request.getLocation());

        if (newImages != null && !newImages.isEmpty() && !newImages.get(0).isEmpty()) {
            // Delete old images
            for (ListingImage img : listing.getImages()) {
                fileUploadUtil.deleteFile(img.getImageUrl());
            }
            listing.getImages().clear();
            listingImageRepository.deleteByListingId(listing.getId());

            int order = 0;
            for (MultipartFile image : newImages) {
                if (!image.isEmpty()) {
                    String filename = fileUploadUtil.uploadFile(image);
                    ListingImage listingImage = ListingImage.builder()
                            .listing(listing)
                            .imageUrl(filename)
                            .displayOrder(order++)
                            .build();
                    listing.getImages().add(listingImage);
                }
            }
        }

        listing = listingRepository.save(listing);
        return mapToResponse(listing, user.getId());
    }

    @Transactional
    public void deleteListing(Long id, User user) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getSeller().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You can only delete your own listings");
        }

        for (ListingImage img : listing.getImages()) {
            fileUploadUtil.deleteFile(img.getImageUrl());
        }

        listingRepository.delete(listing);
    }

    public ListingResponse getListingById(Long id, Long currentUserId) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        return mapToResponse(listing, currentUserId);
    }

    public Page<ListingResponse> searchListings(String search, Category category,
            ListingCondition condition, String location, BigDecimal minPrice, BigDecimal maxPrice,
            String sort, int page, int size, Long currentUserId) {

        Sort sorting = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sort != null) {
            switch (sort) {
                case "price_asc" -> sorting = Sort.by(Sort.Direction.ASC, "price");
                case "price_desc" -> sorting = Sort.by(Sort.Direction.DESC, "price");
                case "newest" -> sorting = Sort.by(Sort.Direction.DESC, "createdAt");
                case "oldest" -> sorting = Sort.by(Sort.Direction.ASC, "createdAt");
            }
        }

        Pageable pageable = PageRequest.of(page, size, sorting);
        Page<Listing> listings = listingRepository.searchListings(
                ListingStatus.ACTIVE, search, category, condition, location, minPrice, maxPrice, pageable);

        return listings.map(l -> mapToResponse(l, currentUserId));
    }

    public List<ListingResponse> getFeaturedListings(Long currentUserId) {
        return listingRepository.findTop8ByStatusOrderByCreatedAtDesc(ListingStatus.ACTIVE).stream()
                .map(l -> mapToResponse(l, currentUserId))
                .collect(Collectors.toList());
    }

    public List<ListingResponse> getSimilarListings(Long listingId, Long currentUserId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        Pageable pageable = PageRequest.of(0, 4, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> similar = listingRepository.searchListings(
                ListingStatus.ACTIVE, null, listing.getCategory(), null, null, null, null, pageable);

        return similar.getContent().stream()
                .filter(l -> !l.getId().equals(listingId))
                .map(l -> mapToResponse(l, currentUserId))
                .collect(Collectors.toList());
    }

    public PublicStatsResponse getPublicStats() {
        Map<String, Long> categoryMap = new LinkedHashMap<>();
        List<Object[]> categoryCounts = listingRepository.countByStatusGroupByCategory(ListingStatus.ACTIVE);
        for (Object[] row : categoryCounts) {
            categoryMap.put(((Category) row[0]).name(), (Long) row[1]);
        }

        long activeCount = listingRepository.countByStatus(ListingStatus.ACTIVE);
        long studentCount = userRepository.countByRole(Role.STUDENT);
        long completedExchanges = transactionRepository.countByStatus(TransactionStatus.COMPLETED);

        return PublicStatsResponse.builder()
                .totalStudents(studentCount > 0 ? studentCount : 500)
                .totalListings(listingRepository.count())
                .activeListings(activeCount > 0 ? activeCount : 250)
                .totalCategories(Category.values().length)
                .completedExchanges(completedExchanges > 0 ? completedExchanges : 100)
                .listingsByCategory(categoryMap)
                .build();
    }

    public List<ListingResponse> getMyListings(User user) {
        return listingRepository.findBySellerOrderByCreatedAtDesc(user).stream()
                .map(l -> mapToResponse(l, user.getId()))
                .collect(Collectors.toList());
    }

    public List<ListingResponse> getMySoldListings(User user) {
        return listingRepository.findBySellerAndStatusOrderByCreatedAtDesc(user, ListingStatus.SOLD).stream()
                .map(l -> mapToResponse(l, user.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ListingResponse updateListingStatus(Long id, ListingStatus newStatus, Long buyerId, User user) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!listing.getSeller().getId().equals(user.getId())) {
            throw new ForbiddenException("Only the seller can change listing status");
        }

        listing.setStatus(newStatus);
        listing = listingRepository.save(listing);

        if (newStatus == ListingStatus.SOLD && buyerId != null) {
            User buyer = userRepository.findById(buyerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));

            Transaction transaction = Transaction.builder()
                    .listing(listing)
                    .buyer(buyer)
                    .seller(user)
                    .amount(listing.getPrice())
                    .status(TransactionStatus.COMPLETED)
                    .build();
            transactionRepository.save(transaction);

            notificationService.createNotification(buyer, NotificationType.LISTING_SOLD,
                    "Item Purchased", "The item '" + listing.getTitle() + "' has been marked as sold to you.",
                    listing.getId());
        }

        return mapToResponse(listing, user.getId());
    }

    public ListingResponse mapToResponse(Listing listing, Long currentUserId) {
        boolean isFavorited = false;
        if (currentUserId != null) {
            isFavorited = favoriteRepository.existsByUserIdAndListingId(currentUserId, listing.getId());
        }
        long favoriteCount = favoriteRepository.countByListingId(listing.getId());

        List<String> imageUrls = listing.getImages().stream()
                .sorted(Comparator.comparingInt(ListingImage::getDisplayOrder))
                .map(img -> "/uploads/" + img.getImageUrl())
                .collect(Collectors.toList());

        User seller = listing.getSeller();
        long sellerListingCount = listingRepository.countBySeller(seller);
        long sellerSoldCount = listingRepository.countBySellerAndStatus(seller, ListingStatus.SOLD);

        UserResponse sellerResponse = UserResponse.builder()
                .id(seller.getId())
                .fullName(seller.getFullName())
                .email(seller.getEmail())
                .department(seller.getDepartment())
                .year(seller.getYear())
                .studentId(seller.getStudentId())
                .profileImage(seller.getProfileImage())
                .role(seller.getRole())
                .emailVerified(seller.isEmailVerified())
                .accountActive(seller.isAccountActive())
                .rating(seller.getRating())
                .ratingCount(seller.getRatingCount())
                .listingCount(sellerListingCount)
                .soldCount(sellerSoldCount)
                .createdAt(seller.getCreatedAt())
                .build();

        return ListingResponse.builder()
                .id(listing.getId())
                .seller(sellerResponse)
                .title(listing.getTitle())
                .description(listing.getDescription())
                .category(listing.getCategory())
                .price(listing.getPrice())
                .itemCondition(listing.getItemCondition())
                .status(listing.getStatus())
                .location(listing.getLocation())
                .images(imageUrls)
                .isFavorited(isFavorited)
                .favoriteCount(favoriteCount)
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }
}
