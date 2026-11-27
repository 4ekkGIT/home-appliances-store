package com.nexora.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "email_verification_tokens")
@Getter
public class EmailVerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private StoreUser user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "used_at")
    private OffsetDateTime usedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected EmailVerificationToken() {
    }

    public EmailVerificationToken(StoreUser user, String tokenHash, OffsetDateTime expiresAt) {
        this.user = user;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public void markUsed() {
        this.usedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    @PrePersist
    private void onCreate() {
        createdAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
