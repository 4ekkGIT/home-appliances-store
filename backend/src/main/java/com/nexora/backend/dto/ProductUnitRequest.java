package com.nexora.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductUnitRequest(
        @NotNull Long productId,
        @NotNull Long warehouseId,
        @Size(max = 150) String serialNumber,
        @Size(max = 100) String inventoryCode
) {}
