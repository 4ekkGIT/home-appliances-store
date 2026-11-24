package com.nexora.backend.service;

import com.nexora.backend.dto.AvailableStockResponse;
import com.nexora.backend.dto.InventoryMovementResponse;
import com.nexora.backend.dto.InventoryStatusRequest;
import com.nexora.backend.dto.InventoryTransferRequest;
import com.nexora.backend.dto.ProductUnitRequest;
import com.nexora.backend.dto.ProductUnitResponse;
import com.nexora.backend.entity.InventoryMovement;
import com.nexora.backend.entity.Product;
import com.nexora.backend.entity.ProductUnit;
import com.nexora.backend.entity.StoreUser;
import com.nexora.backend.entity.Warehouse;
import com.nexora.backend.repository.InventoryMovementRepository;
import com.nexora.backend.repository.ProductRepository;
import com.nexora.backend.repository.ProductUnitRepository;
import com.nexora.backend.repository.StoreUserRepository;
import com.nexora.backend.repository.WarehouseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class InventoryService {
    private static final Map<ProductUnit.Status, Set<ProductUnit.Status>> ALLOWED_TRANSITIONS;

    static {
        Map<ProductUnit.Status, Set<ProductUnit.Status>> transitions =
                new EnumMap<>(ProductUnit.Status.class);
        transitions.put(ProductUnit.Status.AVAILABLE,
                Set.of(ProductUnit.Status.RESERVED, ProductUnit.Status.DAMAGED,
                        ProductUnit.Status.RETURNED, ProductUnit.Status.WRITTEN_OFF));
        transitions.put(ProductUnit.Status.RESERVED,
                Set.of(ProductUnit.Status.AVAILABLE, ProductUnit.Status.SOLD,
                        ProductUnit.Status.DAMAGED, ProductUnit.Status.WRITTEN_OFF));
        transitions.put(ProductUnit.Status.DAMAGED,
                Set.of(ProductUnit.Status.AVAILABLE, ProductUnit.Status.RETURNED,
                        ProductUnit.Status.WRITTEN_OFF));
        transitions.put(ProductUnit.Status.RETURNED,
                Set.of(ProductUnit.Status.AVAILABLE, ProductUnit.Status.DAMAGED,
                        ProductUnit.Status.WRITTEN_OFF));
        transitions.put(ProductUnit.Status.SOLD, Set.of());
        transitions.put(ProductUnit.Status.WRITTEN_OFF, Set.of());
        ALLOWED_TRANSITIONS = transitions;
    }

    private final ProductUnitRepository unitRepository;
    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final StoreUserRepository userRepository;

    public InventoryService(ProductUnitRepository unitRepository,
                            InventoryMovementRepository movementRepository,
                            ProductRepository productRepository,
                            WarehouseRepository warehouseRepository,
                            StoreUserRepository userRepository) {
        this.unitRepository = unitRepository;
        this.movementRepository = movementRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductUnitResponse> findAllUnits() {
        return unitRepository.findAllByOrderByIdDesc().stream()
                .map(ProductUnitResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductUnitResponse findUnitById(Long id) {
        return ProductUnitResponse.from(getUnit(id));
    }

    @Transactional
    public ProductUnitResponse registerUnit(ProductUnitRequest request, Authentication authentication) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        Warehouse warehouse = getActiveWarehouse(request.warehouseId());

        String serialNumber = trimToNull(request.serialNumber());
        if (serialNumber != null && unitRepository.existsBySerialNumber(serialNumber)) {
            throw conflict("Serial number already exists");
        }

        String inventoryCode = trimToNull(request.inventoryCode());
        if (inventoryCode == null) {
            inventoryCode = generateInventoryCode(product);
        } else if (unitRepository.existsByInventoryCode(inventoryCode)) {
            throw conflict("Inventory code already exists");
        }

        ProductUnit unit = new ProductUnit(product, warehouse, inventoryCode, serialNumber);
        unit = unitRepository.save(unit);
        movementRepository.save(new InventoryMovement(
                unit, null, warehouse, null, getActor(authentication),
                InventoryMovement.MovementType.RECEIPT,
                null, ProductUnit.Status.AVAILABLE,
                "Registered product unit"
        ));
        return ProductUnitResponse.from(unit);
    }

    @Transactional
    public ProductUnitResponse transferUnit(Long unitId, InventoryTransferRequest request,
                                            Authentication authentication) {
        ProductUnit unit = getUnit(unitId);
        Warehouse fromWarehouse = unit.getWarehouse();
        if (fromWarehouse == null) {
            throw badRequest("Unit has no warehouse location");
        }

        Warehouse toWarehouse = getActiveWarehouse(request.toWarehouseId());
        if (fromWarehouse.getId().equals(toWarehouse.getId())) {
            throw badRequest("Source and destination warehouses must differ");
        }
        if (unit.getStatus() != ProductUnit.Status.AVAILABLE
                && unit.getStatus() != ProductUnit.Status.RESERVED
                && unit.getStatus() != ProductUnit.Status.DAMAGED
                && unit.getStatus() != ProductUnit.Status.RETURNED) {
            throw badRequest("Unit cannot be transferred in its current status");
        }

        unit.updateLocation(toWarehouse);
        unitRepository.save(unit);
        movementRepository.save(new InventoryMovement(
                unit, fromWarehouse, toWarehouse, null, getActor(authentication),
                InventoryMovement.MovementType.TRANSFER,
                unit.getStatus(), unit.getStatus(), request.comment()
        ));
        return ProductUnitResponse.from(unit);
    }

    @Transactional
    public ProductUnitResponse changeStatus(Long unitId, InventoryStatusRequest request,
                                            Authentication authentication) {
        ProductUnit unit = getUnit(unitId);
        ProductUnit.Status previousStatus = unit.getStatus();
        ProductUnit.Status newStatus = request.status();
        Warehouse previousWarehouse = unit.getWarehouse();

        if (previousStatus == newStatus) {
            throw badRequest("Status is unchanged");
        }
        if (!ALLOWED_TRANSITIONS.getOrDefault(previousStatus, Set.of()).contains(newStatus)) {
            throw badRequest("Status transition " + previousStatus + " -> " + newStatus + " is not allowed");
        }

        unit.changeStatus(newStatus);
        unitRepository.save(unit);
        movementRepository.save(new InventoryMovement(
                unit,
                newStatus == ProductUnit.Status.SOLD || newStatus == ProductUnit.Status.WRITTEN_OFF
                        ? previousWarehouse : unit.getWarehouse(),
                unit.getWarehouse(),
                null,
                getActor(authentication),
                newStatus == ProductUnit.Status.WRITTEN_OFF
                        ? InventoryMovement.MovementType.WRITE_OFF
                        : InventoryMovement.MovementType.STATUS_CHANGE,
                previousStatus,
                newStatus,
                request.comment()
        ));
        return ProductUnitResponse.from(unit);
    }

    @Transactional(readOnly = true)
    public List<InventoryMovementResponse> findUnitMovements(Long unitId) {
        getUnit(unitId);
        return movementRepository.findByProductUnitIdOrderByCreatedAtDesc(unitId).stream()
                .map(InventoryMovementResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AvailableStockResponse getAvailableStock(Long productId, Long warehouseId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (warehouseId != null) {
            warehouseRepository.findById(warehouseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Warehouse not found"));
        }

        long quantity = warehouseId == null
                ? unitRepository.countByProductIdAndStatus(productId, ProductUnit.Status.AVAILABLE)
                : unitRepository.countByProductIdAndWarehouseIdAndStatus(
                        productId, warehouseId, ProductUnit.Status.AVAILABLE);
        return new AvailableStockResponse(productId, warehouseId, quantity);
    }

    private ProductUnit getUnit(Long id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product unit not found"));
    }

    private Warehouse getActiveWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Warehouse not found"));
        if (!warehouse.isActive()) {
            throw badRequest("Warehouse is inactive");
        }
        return warehouse;
    }

    private StoreUser getActor(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName()).orElse(null);
    }

    private String generateInventoryCode(Product product) {
        String code;
        do {
            code = "PU-" + product.getId() + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        } while (unitRepository.existsByInventoryCode(code));
        return code;
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
