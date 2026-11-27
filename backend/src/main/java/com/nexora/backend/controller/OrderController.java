package com.nexora.backend.controller;

import com.nexora.backend.dto.CheckoutRequest;
import com.nexora.backend.dto.CheckoutResponse;
import com.nexora.backend.dto.AdminOrderResponse;
import com.nexora.backend.dto.OrderStatusRequest;
import com.nexora.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CheckoutResponse create(@Valid @RequestBody CheckoutRequest request,
                                   Authentication authentication) {
        return orderService.create(request, authentication.getName());
    }

    @GetMapping
    public List<AdminOrderResponse> findAll() {
        return orderService.findAllForAdmin();
    }

    @PutMapping("/{id}/status")
    public AdminOrderResponse updateStatus(@PathVariable Long id,
                                           @Valid @RequestBody OrderStatusRequest request,
                                           Authentication authentication) {
        return orderService.updateStatus(id, request.status(), authentication);
    }
}