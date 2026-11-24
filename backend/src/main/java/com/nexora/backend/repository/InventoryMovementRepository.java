package com.nexora.backend.repository;

import com.nexora.backend.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    List<InventoryMovement> findByProductUnitIdOrderByCreatedAtDesc(Long productUnitId);
    List<InventoryMovement> findByOrderIdOrderByCreatedAtDesc(Long orderId);
}
