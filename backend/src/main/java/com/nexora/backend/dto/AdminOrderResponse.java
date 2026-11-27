package com.nexora.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record AdminOrderResponse(
        Long id,
        String customerEmail,
        String status,
        BigDecimal totalAmount,
        Address shippingAddress,
        OffsetDateTime createdAt,
        List<Item> items
) {
        public record Address(String contactName, String email, String phone, String street,
                                                  String building, String apartment, String city, String postalCode,
                                                  String country, BigDecimal subtotal, BigDecimal deliveryFee) {}

    public record Item(Long productId, String productName, Integer quantity,
                       BigDecimal unitPrice, BigDecimal lineTotal) {}
}