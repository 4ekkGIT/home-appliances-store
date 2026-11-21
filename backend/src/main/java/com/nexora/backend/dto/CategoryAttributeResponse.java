package com.nexora.backend.dto;

import com.nexora.backend.entity.CategoryAttribute;

import java.util.List;

public record CategoryAttributeResponse(
        Long id,
        Long categoryId,
        String name,
        String slug,
        CategoryAttribute.DataType dataType,
        String unit,
        List<String> options,
        boolean required,
        boolean filterable,
        int displayOrder
) {
    public static CategoryAttributeResponse from(CategoryAttribute attribute) {
        return new CategoryAttributeResponse(
                attribute.getId(), attribute.getCategory().getId(), attribute.getName(),
                attribute.getSlug(), attribute.getDataType(), attribute.getUnit(),
                attribute.getOptions(), attribute.isRequired(), attribute.isFilterable(),
                attribute.getDisplayOrder()
        );
    }
}
