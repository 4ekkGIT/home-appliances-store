package com.nexora.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ProductAttributeValuesRequest(
        @NotNull List<@NotNull @Valid ProductAttributeValueRequest> attributes
) {
}
