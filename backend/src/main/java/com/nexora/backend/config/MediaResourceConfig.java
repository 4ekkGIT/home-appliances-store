package com.nexora.backend.config;

import com.nexora.backend.service.ImageStorageService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MediaResourceConfig implements WebMvcConfigurer {
    private final ImageStorageService imageStorageService;

    public MediaResourceConfig(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = imageStorageService.getStoragePath().toUri().toString();
        if (!location.endsWith("/")) location += "/";
        registry.addResourceHandler("/api/media/images/**").addResourceLocations(location);
    }
}