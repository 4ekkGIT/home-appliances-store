package com.nexora.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
        @NotNull Long categoryId,
        Long brandId,
        @NotBlank @Size(max = 200) String name,
        @Size(max = 220) String slug,
        @Size(max = 5000) String description,
        @NotNull @DecimalMin("0") BigDecimal price,
        Boolean active
) {}
