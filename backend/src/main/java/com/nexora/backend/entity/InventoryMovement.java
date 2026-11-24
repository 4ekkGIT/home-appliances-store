package com.nexora.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Table(
        name = "inventory_movements",
        indexes = {
                @Index(name = "idx_inventory_movements_unit", columnList = "product_unit_id,created_at"),
                @Index(name = "idx_inventory_movements_order", columnList = "order_id")
        }
)
@Getter
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_unit_id", nullable = false)
    private ProductUnit productUnit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_warehouse_id")
    private Warehouse fromWarehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_warehouse_id")
    private Warehouse toWarehouse;

    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    private StoreUser actorUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 20)
    private MovementType movementType;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 20)
    private ProductUnit.Status previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 20)
    private ProductUnit.Status newStatus;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected InventoryMovement() {
    }

    public InventoryMovement(ProductUnit productUnit, Warehouse fromWarehouse, Warehouse toWarehouse,
                             Long orderId, StoreUser actorUser, MovementType movementType,
                             ProductUnit.Status previousStatus, ProductUnit.Status newStatus,
                             String comment) {
        this.productUnit = productUnit;
        this.fromWarehouse = fromWarehouse;
        this.toWarehouse = toWarehouse;
        this.orderId = orderId;
        this.actorUser = actorUser;
        this.movementType = movementType;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.comment = comment;
    }

    @PrePersist
    private void onCreate() {
        createdAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    public enum MovementType {
        RECEIPT,
        TRANSFER,
        RESERVATION,
        RELEASE,
        SALE,
        RETURN,
        WRITE_OFF,
        STATUS_CHANGE
    }
}
