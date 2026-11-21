package com.nexora.backend.dto;

import com.nexora.backend.entity.Product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductResponse(
        Long id, Long categoryId, String categoryName,
        Long brandId, String brandName, String name, String slug,
        String description, BigDecimal price, Boolean active,
        LocalDateTime createdAt, LocalDateTime updatedAt,
        List<ProductAttributeValueResponse> attributes,
        List<ProductImageResponse> images
) {
    public static ProductResponse from(Product product,
                                       List<ProductAttributeValueResponse> attributes,
                                       List<ProductImageResponse> images) {
        return new ProductResponse(
                product.getId(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getBrand() == null ? null : product.getBrand().getId(),
                product.getBrand() == null ? null : product.getBrand().getName(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getActive(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                attributes,
                images
        );
    }
}
