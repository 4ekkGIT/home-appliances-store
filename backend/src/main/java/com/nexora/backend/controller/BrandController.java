package com.nexora.backend.controller;

import com.nexora.backend.dto.BrandRequest;
import com.nexora.backend.dto.BrandResponse;
import com.nexora.backend.service.BrandService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {
    private final BrandService service;

    public BrandController(BrandService service) {
        this.service = service;
    }

    @GetMapping
    public List<BrandResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public BrandResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BrandResponse create(@Valid @RequestBody BrandRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public BrandResponse update(@PathVariable Long id,
                                @Valid @RequestBody BrandRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
