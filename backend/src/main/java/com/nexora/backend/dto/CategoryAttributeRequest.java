package com.nexora.backend.dto;

import com.nexora.backend.entity.CategoryAttribute;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CategoryAttributeRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 120) String slug,
        @NotNull CategoryAttribute.DataType dataType,
        @Size(max = 30) String unit,
        List<@NotBlank @Size(max = 100) String> options,
        boolean required,
        boolean filterable,
        @Min(0) int displayOrder
) {
}
