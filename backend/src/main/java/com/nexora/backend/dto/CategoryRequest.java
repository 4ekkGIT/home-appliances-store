package com.nexora.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 120) String slug,
                @Size(max = 1000) String description,
                @Size(max = 500) String imageUrl
) {
        public CategoryRequest(String name, String slug, String description) {
                this(name, slug, description, null);
        }
}
