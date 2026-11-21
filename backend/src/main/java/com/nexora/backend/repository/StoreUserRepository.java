package com.nexora.backend.repository;

import com.nexora.backend.entity.StoreUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface StoreUserRepository extends JpaRepository<StoreUser, Long> {
    Optional<StoreUser> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    @Transactional
    void deleteByEmailIgnoreCase(String email);
}
