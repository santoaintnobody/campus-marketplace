package com.campus.marketplace.repository;

import com.campus.marketplace.entity.Listing;
import com.campus.marketplace.entity.User;
import com.campus.marketplace.entity.enums.Category;
import com.campus.marketplace.entity.enums.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    List<Listing> findBySellerOrderByCreatedAtDesc(User seller);

    List<Listing> findBySellerAndStatusOrderByCreatedAtDesc(User seller, ListingStatus status);

    long countByStatus(ListingStatus status);

    long countByCategory(Category category);

    long countBySeller(User seller);

    long countBySellerAndStatus(User seller, ListingStatus status);

    List<Listing> findTop8ByStatusOrderByCreatedAtDesc(ListingStatus status);

    @Query("SELECT l FROM Listing l WHERE l.status = :status " +
           "AND (:search IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(l.location) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(l.seller.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR l.category = :category) " +
           "AND (:condition IS NULL OR l.itemCondition = :condition) " +
           "AND (:location IS NULL OR LOWER(l.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:minPrice IS NULL OR l.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR l.price <= :maxPrice)")
    Page<Listing> searchListings(
            @Param("status") ListingStatus status,
            @Param("search") String search,
            @Param("category") Category category,
            @Param("condition") com.campus.marketplace.entity.enums.ListingCondition condition,
            @Param("location") String location,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    @Query("SELECT l.category, COUNT(l) FROM Listing l WHERE l.status = :status GROUP BY l.category")
    List<Object[]> countByStatusGroupByCategory(@Param("status") ListingStatus status);
}
