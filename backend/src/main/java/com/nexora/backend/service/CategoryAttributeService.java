package com.nexora.backend.service;

import com.nexora.backend.dto.CategoryAttributeRequest;
import com.nexora.backend.dto.CategoryAttributeResponse;
import com.nexora.backend.entity.Category;
import com.nexora.backend.entity.CategoryAttribute;
import com.nexora.backend.repository.CategoryAttributeRepository;
import com.nexora.backend.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryAttributeService {
    private final CategoryAttributeRepository attributeRepository;
    private final CategoryRepository categoryRepository;
    private final SlugService slugService;

    public CategoryAttributeService(CategoryAttributeRepository attributeRepository,
                                    CategoryRepository categoryRepository,
                                    SlugService slugService) {
        this.attributeRepository = attributeRepository;
        this.categoryRepository = categoryRepository;
        this.slugService = slugService;
    }

    @Transactional(readOnly = true)
    public List<CategoryAttributeResponse> findAll(Long categoryId) {
        getCategory(categoryId);
        return attributeRepository.findAllByCategoryIdOrderByDisplayOrder(categoryId).stream()
                .map(CategoryAttributeResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryAttributeResponse findById(Long categoryId, Long attributeId) {
        return CategoryAttributeResponse.from(getAttribute(categoryId, attributeId));
    }

    @Transactional
    public CategoryAttributeResponse create(Long categoryId, CategoryAttributeRequest request) {
        Category category = getCategory(categoryId);
        String name = request.name().trim();
        String slug = toSlug(request.slug(), name);
        ensureSlugAvailable(categoryId, slug, null);
        validateOptions(request);
        CategoryAttribute attribute = new CategoryAttribute(
                category, name, slug, request.dataType(), request.unit(), request.options(),
                request.required(), request.filterable(), request.displayOrder()
        );
        return CategoryAttributeResponse.from(attributeRepository.save(attribute));
    }

    @Transactional
    public CategoryAttributeResponse update(Long categoryId, Long attributeId,
                                            CategoryAttributeRequest request) {
        CategoryAttribute attribute = getAttribute(categoryId, attributeId);
        String name = request.name().trim();
        String slug = toSlug(request.slug(), name);
        ensureSlugAvailable(categoryId, slug, attributeId);
        validateOptions(request);
        attribute.updateDetails(name, slug, request.dataType(), request.unit(), request.options(),
                request.required(), request.filterable(), request.displayOrder());
        return CategoryAttributeResponse.from(attributeRepository.save(attribute));
    }

    @Transactional
    public void delete(Long categoryId, Long attributeId) {
        attributeRepository.delete(getAttribute(categoryId, attributeId));
    }

    private Category getCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    private CategoryAttribute getAttribute(Long categoryId, Long attributeId) {
        return attributeRepository.findById(attributeId)
                .filter(attribute -> attribute.getCategory().getId().equals(categoryId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category attribute not found"));
    }

    private String toSlug(String requestedSlug, String name) {
        return slugService.toSlug(requestedSlug == null || requestedSlug.isBlank() ? name : requestedSlug);
    }

    private void ensureSlugAvailable(Long categoryId, String slug, Long exceptId) {
        boolean exists = attributeRepository.findByCategoryIdAndSlug(categoryId, slug)
                .filter(attribute -> !attribute.getId().equals(exceptId))
                .isPresent();
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category attribute slug already exists");
        }
    }

    private void validateOptions(CategoryAttributeRequest request) {
        List<String> options = request.options() == null ? List.of() : request.options();
        if (request.dataType() == CategoryAttribute.DataType.SELECT && options.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SELECT attributes require options");
        }
        if (request.dataType() != CategoryAttribute.DataType.SELECT && !options.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only SELECT attributes can have options");
        }
    }
}
