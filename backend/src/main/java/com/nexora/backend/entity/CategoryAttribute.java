package com.nexora.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(
        name = "category_attributes",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_category_attribute_slug", columnNames = {"category_id", "slug"}),
                @UniqueConstraint(name = "uq_category_attribute_id_category", columnNames = {"id", "category_id"})
        }
)
@Getter
public class CategoryAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 120)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false, length = 20)
    private DataType dataType;

    @Column(length = 30)
    private String unit;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private List<String> options = List.of();

    @Column(name = "is_required", nullable = false)
    private boolean required;

    @Column(name = "is_filterable", nullable = false)
    private boolean filterable;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected CategoryAttribute() {
    }

    public CategoryAttribute(Category category, String name, String slug, DataType dataType,
                             String unit, List<String> options, boolean required,
                             boolean filterable, int displayOrder) {
        this.category = category;
        this.name = name;
        this.slug = slug;
        this.dataType = dataType;
        this.unit = unit;
        this.options = options == null ? List.of() : List.copyOf(options);
        this.required = required;
        this.filterable = filterable;
        this.displayOrder = displayOrder;
    }

    public void updateDetails(String name, String slug, DataType dataType, String unit,
                              List<String> options, boolean required, boolean filterable,
                              int displayOrder) {
        this.name = name;
        this.slug = slug;
        this.dataType = dataType;
        this.unit = unit;
        this.options = options == null ? List.of() : List.copyOf(options);
        this.required = required;
        this.filterable = filterable;
        this.displayOrder = displayOrder;
    }

    public enum DataType {
        TEXT,
        NUMBER,
        BOOLEAN,
        SELECT
    }
}
