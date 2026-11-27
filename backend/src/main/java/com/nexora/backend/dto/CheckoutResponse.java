package com.nexora.backend.dto;

import java.math.BigDecimal;

public record CheckoutResponse(
        Long orderId,
        String status,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        BigDecimal total,
        String paymentMethod
) {}
