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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Table(
        name = "product_units",
        indexes = {
                @Index(name = "idx_product_units_product_status", columnList = "product_id,status"),
                @Index(name = "idx_product_units_warehouse_status", columnList = "warehouse_id,status")
        },
        uniqueConstraints = @UniqueConstraint(
                name = "uq_product_unit_id_product",
                columnNames = {"id", "product_id"}
        )
)
@Getter
public class ProductUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(name = "inventory_code", nullable = false, unique = true, length = 100)
    private String inventoryCode;

    @Column(name = "serial_number", length = 150)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.AVAILABLE;

    @Column(name = "received_at", nullable = false)
    private OffsetDateTime receivedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected ProductUnit() {
    }

    public ProductUnit(Product product, Warehouse warehouse, String inventoryCode, String serialNumber) {
        this.product = product;
        this.warehouse = warehouse;
        this.inventoryCode = inventoryCode;
        this.serialNumber = serialNumber;
    }

    public void updateLocation(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public void changeStatus(Status status) {
        this.status = status;
        if (status == Status.SOLD || status == Status.WRITTEN_OFF) {
            this.warehouse = null;
        }
    }

    @PrePersist
    private void onCreate() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (receivedAt == null) {
            receivedAt = now;
        }
        createdAt = now;
    }

    public enum Status {
        AVAILABLE,
        RESERVED,
        SOLD,
        DAMAGED,
        RETURNED,
        WRITTEN_OFF
    }
}
