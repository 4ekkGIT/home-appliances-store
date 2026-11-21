package com.nexora.backend.repository;

import com.nexora.backend.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    Optional<Brand> findBySlug(String slug);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
}
