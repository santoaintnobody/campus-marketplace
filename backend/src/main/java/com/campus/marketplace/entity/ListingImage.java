package com.campus.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "listing_images")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ListingImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(nullable = false)
    private String imageUrl;

    private Integer displayOrder = 0;
}
