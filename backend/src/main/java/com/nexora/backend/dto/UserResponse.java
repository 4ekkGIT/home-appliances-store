package com.nexora.backend.dto;

import com.nexora.backend.entity.StoreUser;

import java.time.OffsetDateTime;

public record UserResponse(Long id, String firstName, String lastName, String email,
                           String phone, StoreUser.Role role, boolean emailVerified,
                           OffsetDateTime createdAt) {
    public static UserResponse from(StoreUser user) {
        return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getPhone(), user.getRole(), user.isEmailVerified(),
                user.getCreatedAt());
    }
}
