package com.nexora.backend.repository;

import com.nexora.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT product FROM Product product WHERE product.id = :productId")
    Optional<Product> findByIdForUpdate(@Param("productId") Long productId);

    @Query(value = "SELECT EXISTS (SELECT 1 FROM product_units WHERE product_id = :productId) " +
            "OR EXISTS (SELECT 1 FROM order_items WHERE product_id = :productId) " +
            "OR EXISTS (SELECT 1 FROM cart_items WHERE product_id = :productId)", nativeQuery = true)
    boolean hasInventoryOrOrderReferences(@Param("productId") Long productId);

    @Query(value = "SELECT EXISTS (SELECT 1 FROM order_items WHERE product_id = :productId)", nativeQuery = true)
    boolean hasOrderReferences(@Param("productId") Long productId);

    @Query(value = "SELECT EXISTS (SELECT 1 FROM order_items oi " +
            "JOIN orders o ON o.id = oi.order_id " +
            "WHERE oi.product_id = :productId " +
            "AND o.status IN ('PENDING', 'CONFIRMED', 'PROCESSING'))", nativeQuery = true)
    boolean hasActiveOrderReferences(@Param("productId") Long productId);
}
