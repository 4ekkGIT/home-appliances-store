package com.nexora.backend.controller;

import com.nexora.backend.dto.AvailableStockResponse;
import com.nexora.backend.dto.InventoryMovementResponse;
import com.nexora.backend.dto.InventoryStatusRequest;
import com.nexora.backend.dto.InventoryTransferRequest;
import com.nexora.backend.dto.ProductUnitRequest;
import com.nexora.backend.dto.ProductUnitResponse;
import com.nexora.backend.service.InventoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @GetMapping("/units")
    public List<ProductUnitResponse> findAllUnits() {
        return service.findAllUnits();
    }

    @GetMapping("/units/{id}")
    public ProductUnitResponse findUnit(@PathVariable Long id) {
        return service.findUnitById(id);
    }

    @PostMapping("/units")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductUnitResponse registerUnit(@Valid @RequestBody ProductUnitRequest request,
                                            Authentication authentication) {
        return service.registerUnit(request, authentication);
    }

    @PostMapping("/units/{id}/transfer")
    public ProductUnitResponse transferUnit(@PathVariable Long id,
                                            @Valid @RequestBody InventoryTransferRequest request,
                                            Authentication authentication) {
        return service.transferUnit(id, request, authentication);
    }

    @PostMapping("/units/{id}/status")
    public ProductUnitResponse changeStatus(@PathVariable Long id,
                                            @Valid @RequestBody InventoryStatusRequest request,
                                            Authentication authentication) {
        return service.changeStatus(id, request, authentication);
    }

    @GetMapping("/units/{id}/movements")
    public List<InventoryMovementResponse> findMovements(@PathVariable Long id) {
        return service.findUnitMovements(id);
    }

    @GetMapping("/available")
    public AvailableStockResponse getAvailableStock(
            @RequestParam @NotNull Long productId,
            @RequestParam(required = false) Long warehouseId
    ) {
        return service.getAvailableStock(productId, warehouseId);
    }
}
