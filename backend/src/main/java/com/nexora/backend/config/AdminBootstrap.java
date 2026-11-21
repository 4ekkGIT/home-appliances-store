package com.nexora.backend.config;

import com.nexora.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final AuthService authService;
    private final String email;
    private final String password;

    public AdminBootstrap(AuthService authService,
                          @Value("${app.bootstrap-admin.email:}") String email,
                          @Value("${app.bootstrap-admin.password:}") String password) {
        this.authService = authService;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() && password.isBlank()) {
            return;
        }
        if (email.isBlank() || password.isBlank()) {
            throw new IllegalStateException("Set both ADMIN_EMAIL and ADMIN_PASSWORD to bootstrap an admin");
        }
        if (password.length() < 12) {
            throw new IllegalStateException("Bootstrap admin password must have at least 12 characters");
        }
        authService.bootstrapAdmin(email, password);
    }
}
