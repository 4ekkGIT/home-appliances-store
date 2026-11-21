package com.nexora.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        @NotNull Long categoryId,
        Long brandId,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 220) String slug,
        @Size(max = 5000) String description,
        @NotNull @DecimalMin("0") BigDecimal price,
        Boolean active,
        List<@NotNull @Valid ProductAttributeValueRequest> attributes,
        List<@NotNull @Valid ProductImageRequest> images
) {
    public ProductRequest(Long categoryId, Long brandId, String name, String slug,
                          String description, BigDecimal price, Boolean active) {
        this(categoryId, brandId, name, slug, description, price, active, null, null);
    }
}
