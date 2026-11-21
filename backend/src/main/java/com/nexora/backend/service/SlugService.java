package com.nexora.backend.service;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.Locale;

@Component
public class SlugService {
    public String toSlug(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? "item" : normalized;
    }
}
