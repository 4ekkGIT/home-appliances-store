
package com.nexora.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "products",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_products_id_category",
                columnNames = {"id", "category_id"}
        )
)
@Getter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Product() {
    }

    public Product(Category category, Brand brand, String name, String slug,
                   String description, BigDecimal price) {
        this.category = category;
        this.brand = brand;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.price = price;
    }

    public void updateDetails(Category category, Brand brand, String name, String slug,
                              String description, BigDecimal price, Boolean active) {
        this.category = category;
        this.brand = brand;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.price = price;
        this.active = active;
    }

    @PrePersist
    private void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    private void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
