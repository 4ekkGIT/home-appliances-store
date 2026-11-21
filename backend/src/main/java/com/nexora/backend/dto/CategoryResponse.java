package com.nexora.backend.dto;

import com.nexora.backend.entity.Category;

import java.time.LocalDateTime;

public record CategoryResponse(
        Long id, String name, String slug, String description, LocalDateTime createdAt
) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(), category.getName(), category.getSlug(),
                category.getDescription(), category.getCreatedAt()
        );
    }
}
