package com.nexora.backend.dto;

import com.nexora.backend.entity.Warehouse;

import java.time.OffsetDateTime;

public record WarehouseResponse(
        Long id,
        String name,
        String address,
        boolean active,
        OffsetDateTime createdAt
) {
    public static WarehouseResponse from(Warehouse warehouse) {
        return new WarehouseResponse(
                warehouse.getId(),
                warehouse.getName(),
                warehouse.getAddress(),
                warehouse.isActive(),
                warehouse.getCreatedAt()
        );
    }
}
