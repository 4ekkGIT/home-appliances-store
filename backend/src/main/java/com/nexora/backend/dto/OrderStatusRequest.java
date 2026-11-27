package com.nexora.backend.dto;

import jakarta.validation.constraints.NotNull;

public record OrderStatusRequest(@NotNull Status status) {
    public enum Status {
        PENDING,
        CONFIRMED,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED
    }
}