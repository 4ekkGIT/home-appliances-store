package com.nexora.backend.dto;

import com.nexora.backend.entity.ProductImage;

public record ProductImageResponse(
        Long id,
        String imageUrl,
        String altText,
        int displayOrder,
        boolean primary
) {
    public static ProductImageResponse from(ProductImage image) {
        return new ProductImageResponse(
                image.getId(), image.getImageUrl(), image.getAltText(),
                image.getDisplayOrder(), image.isPrimary()
        );
    }
}
