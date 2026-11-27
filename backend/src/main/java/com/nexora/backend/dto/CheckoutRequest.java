package com.nexora.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CheckoutRequest(
        @NotEmpty @Size(max = 100) List<@Valid Item> items,
        @NotNull @Valid Address address
) {
    public record Item(
            @NotNull @Positive Long productId,
            @NotNull @Min(1) @Max(100) Integer quantity
    ) {}

    public record Address(
            @NotBlank @Size(min = 2, max = 100) String contactName,
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Pattern(regexp = "[+()0-9 .-]{7,30}") String phone,
            @NotBlank @Size(max = 200) String street,
            @NotBlank @Size(max = 50) String building,
            @Size(max = 30) String apartment,
            @NotBlank @Size(max = 100) String city,
            @NotBlank @Size(max = 20) String postalCode,
            @NotBlank @Size(max = 100) String country
    ) {}
}