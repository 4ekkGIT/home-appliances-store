package com.nexora.backend.dto;

import com.nexora.backend.entity.Brand;

import java.time.LocalDateTime;

public record BrandResponse(
        Long id, String name, String slug, String logoUrl, LocalDateTime createdAt
) {
    public static BrandResponse from(Brand brand) {
        return new BrandResponse(
                brand.getId(), brand.getName(), brand.getSlug(),
                brand.getLogoUrl(), brand.getCreatedAt()
        );
    }
}
