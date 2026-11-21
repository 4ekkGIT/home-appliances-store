package com.nexora.backend.repository;

import com.nexora.backend.entity.CategoryAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryAttributeRepository extends JpaRepository<CategoryAttribute, Long> {
    List<CategoryAttribute> findAllByCategoryIdOrderByDisplayOrder(Long categoryId);
    List<CategoryAttribute> findAllByCategoryId(Long categoryId);
    Optional<CategoryAttribute> findByCategoryIdAndSlug(Long categoryId, String slug);
    boolean existsByCategoryIdAndSlug(Long categoryId, String slug);
}
