package com.campus.marketplace.repository;

import com.campus.marketplace.entity.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {
    List<ListingImage> findByListingIdOrderByDisplayOrder(Long listingId);
    void deleteByListingId(Long listingId);
}
