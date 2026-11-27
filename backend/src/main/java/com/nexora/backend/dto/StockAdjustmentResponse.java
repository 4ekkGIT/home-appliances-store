package com.nexora.backend.dto;

public record StockAdjustmentResponse(
        Long productId,
        Long warehouseId,
        long previousAvailableQuantity,
        long availableQuantity
) {}