package com.nexora.backend.service;

import com.nexora.backend.dto.ProductRequest;
import com.nexora.backend.dto.ProductResponse;
import com.nexora.backend.entity.Brand;
import com.nexora.backend.entity.Category;
import com.nexora.backend.entity.Product;
import com.nexora.backend.repository.BrandRepository;
import com.nexora.backend.repository.CategoryRepository;
import com.nexora.backend.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SlugService slugService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository,
                          SlugService slugService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.slugService = slugService;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return ProductResponse.from(getProduct(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Category category = getCategory(request.categoryId());
        Brand brand = request.brandId() == null ? null : getBrand(request.brandId());
        String slug = getUniqueSlug(request.slug(), request.name());
        Product product = new Product(
                category, brand, request.name().trim(), slug,
                request.description(), request.price()
        );
        product.updateDetails(
                category, brand, request.name().trim(), slug, request.description(),
                request.price(), request.active() == null ? true : request.active()
        );
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProduct(id);
        Category category = getCategory(request.categoryId());
        Brand brand = request.brandId() == null ? null : getBrand(request.brandId());
        String slug = request.slug() == null || request.slug().isBlank()
                ? slugService.toSlug(request.name()) : slugService.toSlug(request.slug());
        if (!slug.equals(product.getSlug()) && productRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product slug already exists");
        }
        product.updateDetails(
                category, brand, request.name().trim(), slug, request.description(),
                request.price(), request.active() == null ? true : request.active()
        );
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        productRepository.delete(getProduct(id));
    }

    private String getUniqueSlug(String requestedSlug, String name) {
        String base = requestedSlug == null || requestedSlug.isBlank()
                ? slugService.toSlug(name) : slugService.toSlug(requestedSlug);
        String slug = base;
        int suffix = 2;
        while (productRepository.existsBySlug(slug)) {
            slug = base + "-" + suffix++;
        }
        return slug;
    }

    private Product getProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private Category getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    }

    private Brand getBrand(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found"));
    }
}
