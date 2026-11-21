package com.nexora.backend.service;

import com.nexora.backend.dto.BrandRequest;
import com.nexora.backend.dto.BrandResponse;
import com.nexora.backend.entity.Brand;
import com.nexora.backend.repository.BrandRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BrandService {
    private final BrandRepository repository;
    private final SlugService slugService;

    public BrandService(BrandRepository repository, SlugService slugService) {
        this.repository = repository;
        this.slugService = slugService;
    }

    public List<BrandResponse> findAll() {
        return repository.findAll().stream().map(BrandResponse::from).toList();
    }

    public BrandResponse findById(Long id) {
        return BrandResponse.from(getBrand(id));
    }

    @Transactional
    public BrandResponse create(BrandRequest request) {
        String name = request.name().trim();
        String slug = request.slug() == null || request.slug().isBlank()
                ? slugService.toSlug(name) : slugService.toSlug(request.slug());
        ensureNameAvailable(name, null);
        ensureSlugAvailable(slug, null);
        Brand brand = new Brand(name, slug, request.logoUrl());
        return BrandResponse.from(repository.save(brand));
    }

    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = getBrand(id);
        String name = request.name().trim();
        String slug = request.slug() == null || request.slug().isBlank()
                ? slugService.toSlug(name) : slugService.toSlug(request.slug());
        ensureNameAvailable(name, id);
        ensureSlugAvailable(slug, id);
        brand.updateDetails(name, slug, request.logoUrl());
        return BrandResponse.from(repository.save(brand));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getBrand(id));
    }

    private Brand getBrand(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found"));
    }

    private void ensureNameAvailable(String name, Long exceptId) {
        boolean exists = exceptId == null
                ? repository.existsByNameIgnoreCase(name)
                : repository.existsByNameIgnoreCaseAndIdNot(name, exceptId);
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Brand name already exists");
        }
    }

    private void ensureSlugAvailable(String slug, Long exceptId) {
        boolean exists = exceptId == null
                ? repository.existsBySlug(slug)
                : repository.existsBySlugAndIdNot(slug, exceptId);
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Brand slug already exists");
        }
    }
}
