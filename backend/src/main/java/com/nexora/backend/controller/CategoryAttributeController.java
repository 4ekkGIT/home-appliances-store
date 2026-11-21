package com.nexora.backend.controller;

import com.nexora.backend.dto.CategoryAttributeRequest;
import com.nexora.backend.dto.CategoryAttributeResponse;
import com.nexora.backend.service.CategoryAttributeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/categories/{categoryId}/attributes")
public class CategoryAttributeController {
    private final CategoryAttributeService service;

    public CategoryAttributeController(CategoryAttributeService service) {
        this.service = service;
    }

    @GetMapping
    public List<CategoryAttributeResponse> findAll(@PathVariable Long categoryId) {
        return service.findAll(categoryId);
    }

    @GetMapping("/{attributeId}")
    public CategoryAttributeResponse findById(@PathVariable Long categoryId,
                                              @PathVariable Long attributeId) {
        return service.findById(categoryId, attributeId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryAttributeResponse create(@PathVariable Long categoryId,
                                            @Valid @RequestBody CategoryAttributeRequest request) {
        return service.create(categoryId, request);
    }

    @PutMapping("/{attributeId}")
    public CategoryAttributeResponse update(@PathVariable Long categoryId,
                                            @PathVariable Long attributeId,
                                            @Valid @RequestBody CategoryAttributeRequest request) {
        return service.update(categoryId, attributeId, request);
    }

    @DeleteMapping("/{attributeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long categoryId, @PathVariable Long attributeId) {
        service.delete(categoryId, attributeId);
    }
}
