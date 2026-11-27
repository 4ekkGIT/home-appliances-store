package com.nexora.backend.repository;

import com.nexora.backend.entity.ProductUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductUnitRepository extends JpaRepository<ProductUnit, Long> {
    Optional<ProductUnit> findByInventoryCode(String inventoryCode);
    Optional<ProductUnit> findBySerialNumber(String serialNumber);
    boolean existsByInventoryCode(String inventoryCode);
    boolean existsBySerialNumber(String serialNumber);
    long countByProductIdAndStatus(Long productId, ProductUnit.Status status);
    long countByProductIdAndWarehouseIdAndStatus(Long productId, Long warehouseId, ProductUnit.Status status);
    long countByWarehouseIdAndStatus(Long warehouseId, ProductUnit.Status status);
    List<ProductUnit> findByProductIdAndStatus(Long productId, ProductUnit.Status status);
    List<ProductUnit> findByWarehouseIdAndStatus(Long warehouseId, ProductUnit.Status status);
    List<ProductUnit> findAllByOrderByIdDesc();

    @Query(value = "SELECT * FROM product_units WHERE product_id = :productId " +
            "AND warehouse_id = :warehouseId AND status = 'AVAILABLE' ORDER BY id FOR UPDATE",
            nativeQuery = true)
    List<ProductUnit> findAvailableByProductAndWarehouseForUpdate(
            @Param("productId") Long productId,
            @Param("warehouseId") Long warehouseId);

    @Query(value = "SELECT * FROM product_units WHERE product_id = :productId " +
            "AND status = 'AVAILABLE' ORDER BY id LIMIT :quantity FOR UPDATE", nativeQuery = true)
    List<ProductUnit> findAvailableForUpdate(@Param("productId") Long productId,
                                             @Param("quantity") int quantity);
}
