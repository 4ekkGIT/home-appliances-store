package com.nexora.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductAttributeValueRequest(
        @NotNull Long attributeId,
        String valueText,
        BigDecimal valueNumber,
        Boolean valueBoolean
) {
}
