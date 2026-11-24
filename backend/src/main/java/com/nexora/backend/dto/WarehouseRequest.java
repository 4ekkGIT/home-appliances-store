package com.nexora.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WarehouseRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 5000) String address,
        Boolean active
) {}
