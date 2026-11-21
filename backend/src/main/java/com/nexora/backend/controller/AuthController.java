package com.nexora.backend.controller;

import com.nexora.backend.dto.RegisterRequest;
import com.nexora.backend.dto.UserResponse;
import com.nexora.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @GetMapping("/me")
    public AuthenticatedUser me(Authentication authentication) {
        return new AuthenticatedUser(authentication.getName(), authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).toList());
    }

    public record AuthenticatedUser(String email, List<String> roles) {
    }
}
