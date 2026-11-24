package com.nexora.backend.dto;

public record AvailableStockResponse(
        Long productId,
        Long warehouseId,
        long availableQuantity
) {}
