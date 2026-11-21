package com.nexora.backend.repository;

import com.nexora.backend.entity.Product;
import com.nexora.backend.entity.ProductAttributeValue;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

public final class ProductSpecifications {
    private ProductSpecifications() {
    }

    public static Specification<Product> filter(String search, Long categoryId, Long brandId,
                                                BigDecimal minPrice, BigDecimal maxPrice, Boolean active,
                                                Long attributeId, String valueText,
                                                BigDecimal valueNumber, Boolean valueBoolean) {
        return (root, query, builder) -> {
            var predicates = builder.conjunction();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates = builder.and(predicates, builder.or(
                        builder.like(builder.lower(root.get("name")), pattern),
                        builder.like(builder.lower(root.get("description")), pattern)
                ));
            }
            if (categoryId != null) {
                predicates = builder.and(predicates,
                        builder.equal(root.get("category").get("id"), categoryId));
            }
            if (brandId != null) {
                predicates = builder.and(predicates,
                        builder.equal(root.get("brand").get("id"), brandId));
            }
            if (minPrice != null) {
                predicates = builder.and(predicates, builder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates = builder.and(predicates, builder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (active != null) {
                predicates = builder.and(predicates, builder.equal(root.get("active"), active));
            }
            if (attributeId != null || valueText != null || valueNumber != null || valueBoolean != null) {
                Subquery<Integer> attributeMatch = query.subquery(Integer.class);
                Root<ProductAttributeValue> value = attributeMatch.from(ProductAttributeValue.class);
                var attribute = value.join("attribute");
                var valuePredicates = builder.and(
                        builder.equal(value.get("product").get("id"), root.get("id")),
                        builder.isTrue(attribute.get("filterable"))
                );
                if (attributeId != null) {
                    valuePredicates = builder.and(valuePredicates,
                            builder.equal(attribute.get("id"), attributeId));
                }
                if (valueText != null) {
                    valuePredicates = builder.and(valuePredicates,
                            builder.equal(value.get("valueText"), valueText));
                }
                if (valueNumber != null) {
                    valuePredicates = builder.and(valuePredicates,
                            builder.equal(value.get("valueNumber"), valueNumber));
                }
                if (valueBoolean != null) {
                    valuePredicates = builder.and(valuePredicates,
                            builder.equal(value.get("valueBoolean"), valueBoolean));
                }
                attributeMatch.select(builder.literal(1)).where(valuePredicates);
                predicates = builder.and(predicates, builder.exists(attributeMatch));
            }
            return predicates;
        };
    }
}
