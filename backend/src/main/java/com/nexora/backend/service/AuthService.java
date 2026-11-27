package com.nexora.backend.service;

import com.nexora.backend.dto.RegisterRequest;
import com.nexora.backend.dto.UserResponse;
import com.nexora.backend.entity.StoreUser;
import com.nexora.backend.repository.StoreUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
public class AuthService {
    private final StoreUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationService emailVerificationService;

    public AuthService(StoreUserRepository userRepository, PasswordEncoder passwordEncoder,
                       EmailVerificationService emailVerificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailVerificationService = emailVerificationService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at most 72 bytes");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        StoreUser user = new StoreUser(request.firstName().trim(), trimToNull(request.lastName()),
                email, passwordEncoder.encode(request.password()), trimToNull(request.phone()),
                StoreUser.Role.CUSTOMER);
        StoreUser savedUser = userRepository.save(user);
        emailVerificationService.issueToken(savedUser);
        return UserResponse.from(savedUser);
    }

    @Transactional
    public void bootstrapAdmin(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("Bootstrap admin password must be at most 72 bytes");
        }
        var existing = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (existing.isPresent()) {
            if (existing.get().getRole() != StoreUser.Role.ADMIN) {
                throw new IllegalStateException("Bootstrap admin email belongs to a non-admin user");
            }
            existing.get().verifyEmail();
            return;
        }
        userRepository.save(new StoreUser("Administrator", null, normalizedEmail,
                passwordEncoder.encode(password), null, StoreUser.Role.ADMIN));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
