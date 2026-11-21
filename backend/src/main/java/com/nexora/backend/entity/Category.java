
package com.nexora.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Getter
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Category() {
    }

    public Category(String name, String slug, String description) {
        this.name = name;
        this.slug = slug;
        this.description = description;
    }

    public void updateDetails(String name, String slug, String description) {
        this.name = name;
        this.slug = slug;
        this.description = description;
    }

    @PrePersist
    private void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
