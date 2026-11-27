package com.nexora.backend.service;

import com.nexora.backend.dto.CategoryRequest;
import com.nexora.backend.dto.CategoryResponse;
import com.nexora.backend.entity.Category;
import com.nexora.backend.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository repository;
    private final SlugService slugService;

    public CategoryService(CategoryRepository repository, SlugService slugService) {
        this.repository = repository;
        this.slugService = slugService;
    }

    public List<CategoryResponse> findAll() {
        return repository.findAll().stream().map(CategoryResponse::from).toList();
    }

    public CategoryResponse findById(Long id) {
        return CategoryResponse.from(getCategory(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().trim();
        String slug = request.slug() == null || request.slug().isBlank()
                ? slugService.toSlug(name) : slugService.toSlug(request.slug());
        ensureNameAvailable(name, null);
        ensureSlugAvailable(slug, null);
        Category category = new Category(name, slug, request.description(), trimToNull(request.imageUrl()));
        return CategoryResponse.from(repository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = getCategory(id);
        String name = request.name().trim();
        String slug = request.slug() == null || request.slug().isBlank()
                ? slugService.toSlug(name) : slugService.toSlug(request.slug());
        ensureNameAvailable(name, id);
        ensureSlugAvailable(slug, id);
        category.updateDetails(name, slug, request.description(), trimToNull(request.imageUrl()));
        return CategoryResponse.from(repository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getCategory(id));
    }

    private Category getCategory(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    private void ensureNameAvailable(String name, Long exceptId) {
        boolean exists = exceptId == null
                ? repository.existsByNameIgnoreCase(name)
                : repository.existsByNameIgnoreCaseAndIdNot(name, exceptId);
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category name already exists");
        }
    }

    private void ensureSlugAvailable(String slug, Long exceptId) {
        boolean exists = exceptId == null
                ? repository.existsBySlug(slug)
                : repository.existsBySlugAndIdNot(slug, exceptId);
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category slug already exists");
        }
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
