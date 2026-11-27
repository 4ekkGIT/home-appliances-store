package com.nexora.backend.controller;

import com.nexora.backend.dto.ProductRequest;
import com.nexora.backend.dto.ProductResponse;
import com.nexora.backend.dto.ProductImageResponse;
import com.nexora.backend.dto.PageResponse;
import com.nexora.backend.service.ImageStorageService;
import com.nexora.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    private final ImageStorageService imageStorageService;

    public ProductController(ProductService service, ImageStorageService imageStorageService) {
        this.service = service;
        this.imageStorageService = imageStorageService;
    }

    @GetMapping
    public PageResponse<ProductResponse> findAll(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Long attributeId,
            @RequestParam(required = false) String valueText,
            @RequestParam(required = false) BigDecimal valueNumber,
            @RequestParam(required = false) Boolean valueBoolean,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        return service.search(q, categoryId, brandId, minPrice, maxPrice, active,
                attributeId, valueText, valueNumber, valueBoolean,
                page, size, sortBy, sortDirection);
    }

    @GetMapping("/{id}")
    public ProductResponse findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id,
                                  @Valid @RequestBody ProductRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @DeleteMapping("/{id}/permanent")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePermanently(@PathVariable Long id) {
        List<ProductImageResponse> images = service.findImages(id);
        service.deletePermanently(id);
        images.stream()
                .map(ProductImageResponse::imageUrl)
                .filter(url -> url.startsWith("/api/media/images/"))
                .forEach(imageStorageService::delete);
    }
}
