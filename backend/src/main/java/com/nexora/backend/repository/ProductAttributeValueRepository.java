package com.nexora.backend.repository;

import com.nexora.backend.entity.ProductAttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Long> {
    List<ProductAttributeValue> findAllByProductIdOrderByAttribute_DisplayOrderAsc(Long productId);
    List<ProductAttributeValue> findAllByProductIdInOrderByProductIdAscAttribute_DisplayOrderAsc(
            Collection<Long> productIds);
    Optional<ProductAttributeValue> findByProductIdAndAttributeId(Long productId, Long attributeId);
}
