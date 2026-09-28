package com.campus.marketplace.repository;

import com.campus.marketplace.entity.Offer;
import com.campus.marketplace.entity.User;
import com.campus.marketplace.entity.enums.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByBuyerOrderByCreatedAtDesc(User buyer);

    List<Offer> findBySellerOrderByCreatedAtDesc(User seller);

    List<Offer> findByListingIdOrderByCreatedAtDesc(Long listingId);

    List<Offer> findByBuyerAndStatusOrderByCreatedAtDesc(User buyer, OfferStatus status);

    List<Offer> findBySellerAndStatusOrderByCreatedAtDesc(User seller, OfferStatus status);

    long countBySellerAndStatus(User seller, OfferStatus status);

    long countByBuyerAndStatus(User buyer, OfferStatus status);
}
