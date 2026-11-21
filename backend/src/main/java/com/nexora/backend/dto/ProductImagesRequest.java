package com.nexora.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ProductImagesRequest(
        @NotNull List<@NotNull @Valid ProductImageRequest> images
) {
}
