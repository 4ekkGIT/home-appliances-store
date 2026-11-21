package com.nexora.backend.repository;

import com.nexora.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
}
