package com.nexora.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductImageRequest(
        @NotBlank @Size(max = 500) String imageUrl,
        @Size(max = 200) String altText,
        @Min(0) int displayOrder,
        boolean primary
) {
}
