
package com.nexora.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import java.time.LocalDateTime;

@Entity
@Table(name = "brands")
@Getter
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Brand() {
    }

    public Brand(String name, String slug, String logoUrl) {
        this.name = name;
        this.slug = slug;
        this.logoUrl = logoUrl;
    }

    public void updateDetails(String name, String slug, String logoUrl) {
        this.name = name;
        this.slug = slug;
        this.logoUrl = logoUrl;
    }

    @PrePersist
    private void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
