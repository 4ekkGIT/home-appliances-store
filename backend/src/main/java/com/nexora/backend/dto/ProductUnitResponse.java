package com.nexora.backend.dto;

import com.nexora.backend.entity.ProductUnit;

import java.time.OffsetDateTime;

public record ProductUnitResponse(
        Long id,
        Long productId,
        Long warehouseId,
        String inventoryCode,
        String serialNumber,
        ProductUnit.Status status,
        OffsetDateTime receivedAt,
        OffsetDateTime createdAt
) {
    public static ProductUnitResponse from(ProductUnit unit) {
        return new ProductUnitResponse(
                unit.getId(),
                unit.getProduct().getId(),
                unit.getWarehouse() == null ? null : unit.getWarehouse().getId(),
                unit.getInventoryCode(),
                unit.getSerialNumber(),
                unit.getStatus(),
                unit.getReceivedAt(),
                unit.getCreatedAt()
        );
    }
}
