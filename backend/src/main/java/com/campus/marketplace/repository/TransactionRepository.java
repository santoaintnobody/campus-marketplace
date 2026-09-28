package com.campus.marketplace.repository;

import com.campus.marketplace.entity.Transaction;
import com.campus.marketplace.entity.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByListingId(Long listingId);
    Optional<Transaction> findByListingIdAndStatus(Long listingId, TransactionStatus status);
    List<Transaction> findByBuyerIdOrSellerIdOrderByCreatedAtDesc(Long buyerId, Long sellerId);
    boolean existsByListingIdAndBuyerIdAndStatus(Long listingId, Long buyerId, TransactionStatus status);
    boolean existsByListingIdAndStatus(Long listingId, TransactionStatus status);
    long countByStatus(TransactionStatus status);
}
