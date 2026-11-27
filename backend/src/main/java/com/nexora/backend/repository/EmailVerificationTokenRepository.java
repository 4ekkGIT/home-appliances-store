package com.nexora.backend.repository;

import com.nexora.backend.entity.EmailVerificationToken;
import com.nexora.backend.entity.StoreUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("""
            update EmailVerificationToken t
               set t.usedAt = :usedAt
             where t.user = :user
               and t.usedAt is null
            """)
    void invalidateUnusedForUser(@Param("user") StoreUser user,
                                 @Param("usedAt") OffsetDateTime usedAt);
}
