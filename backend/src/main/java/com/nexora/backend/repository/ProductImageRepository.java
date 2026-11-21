package com.nexora.backend.repository;

import com.nexora.backend.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findAllByProductIdOrderByDisplayOrder(Long productId);
    List<ProductImage> findAllByProductIdInOrderByProductIdAscDisplayOrderAsc(Collection<Long> productIds);
    Optional<ProductImage> findByProductIdAndPrimaryTrue(Long productId);
    Optional<ProductImage> findByProductIdAndDisplayOrder(Long productId, int displayOrder);
}
