package com.campus.marketplace.dto;

import com.campus.marketplace.entity.enums.OfferStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferResponse {

    private Long id;
    private Long listingId;
    private String listingTitle;
    private BigDecimal listingPrice;
    private String listingImage;
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private Long sellerId;
    private String sellerName;
    private BigDecimal offerAmount;
    private BigDecimal counterAmount;
    private String message;
    private OfferStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
