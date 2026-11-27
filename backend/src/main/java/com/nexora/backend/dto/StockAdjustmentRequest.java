package com.nexora.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record StockAdjustmentRequest(
        @NotNull @Positive Long productId,
        @NotNull @Positive Long warehouseId,
        @NotNull @PositiveOrZero @Max(10000) Integer availableQuantity
) {}