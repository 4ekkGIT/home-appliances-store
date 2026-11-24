package com.nexora.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InventoryTransferRequest(
        @NotNull Long toWarehouseId,
        @Size(max = 5000) String comment
) {}
