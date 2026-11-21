package com.nexora.backend.dto;

import com.nexora.backend.entity.CategoryAttribute;
import com.nexora.backend.entity.ProductAttributeValue;

import java.math.BigDecimal;

public record ProductAttributeValueResponse(
        Long attributeId,
        String name,
        String slug,
        CategoryAttribute.DataType dataType,
        String unit,
        String valueText,
        BigDecimal valueNumber,
        Boolean valueBoolean
) {
    public static ProductAttributeValueResponse from(ProductAttributeValue value) {
        CategoryAttribute attribute = value.getAttribute();
        return new ProductAttributeValueResponse(
                attribute.getId(), attribute.getName(), attribute.getSlug(),
                attribute.getDataType(), attribute.getUnit(), value.getValueText(),
                value.getValueNumber(), value.getValueBoolean()
        );
    }
}
