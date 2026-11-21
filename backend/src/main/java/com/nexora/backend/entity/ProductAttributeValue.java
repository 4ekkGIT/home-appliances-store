package com.nexora.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;

import java.math.BigDecimal;

@Entity
@Table(
        name = "product_attribute_values",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_product_attribute",
                columnNames = {"product_id", "attribute_id"}
        )
)
@Getter
public class ProductAttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attribute_id", nullable = false)
    private CategoryAttribute attribute;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "value_text", columnDefinition = "TEXT")
    private String valueText;

    @Column(name = "value_number", precision = 14, scale = 3)
    private BigDecimal valueNumber;

    @Column(name = "value_boolean")
    private Boolean valueBoolean;

    protected ProductAttributeValue() {
    }

    public ProductAttributeValue(Product product, CategoryAttribute attribute,
                                 String valueText, BigDecimal valueNumber, Boolean valueBoolean) {
        this.product = product;
        this.attribute = attribute;
        this.category = product.getCategory();
        this.valueText = valueText;
        this.valueNumber = valueNumber;
        this.valueBoolean = valueBoolean;
    }

    public void updateValue(String valueText, BigDecimal valueNumber, Boolean valueBoolean) {
        this.valueText = valueText;
        this.valueNumber = valueNumber;
        this.valueBoolean = valueBoolean;
    }
}
