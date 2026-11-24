package com.nexora.backend.dto;

import com.nexora.backend.entity.ProductUnit;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InventoryStatusRequest(
        @NotNull ProductUnit.Status status,
        @Size(max = 5000) String comment
) {}
