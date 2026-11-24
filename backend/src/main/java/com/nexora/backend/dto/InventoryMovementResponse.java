package com.nexora.backend.dto;

import com.nexora.backend.entity.InventoryMovement;
import com.nexora.backend.entity.ProductUnit;

import java.time.OffsetDateTime;

public record InventoryMovementResponse(
        Long id,
        Long productUnitId,
        Long fromWarehouseId,
        Long toWarehouseId,
        Long orderId,
        Long actorUserId,
        InventoryMovement.MovementType movementType,
        ProductUnit.Status previousStatus,
        ProductUnit.Status newStatus,
        String comment,
        OffsetDateTime createdAt
) {
    public static InventoryMovementResponse from(InventoryMovement movement) {
        return new InventoryMovementResponse(
                movement.getId(),
                movement.getProductUnit().getId(),
                movement.getFromWarehouse() == null ? null : movement.getFromWarehouse().getId(),
                movement.getToWarehouse() == null ? null : movement.getToWarehouse().getId(),
                movement.getOrderId(),
                movement.getActorUser() == null ? null : movement.getActorUser().getId(),
                movement.getMovementType(),
                movement.getPreviousStatus(),
                movement.getNewStatus(),
                movement.getComment(),
                movement.getCreatedAt()
        );
    }
}
