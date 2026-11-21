package com.nexora.backend.service;

import com.nexora.backend.dto.ProductRequest;
import com.nexora.backend.dto.ProductResponse;
import com.nexora.backend.dto.ProductAttributeValueRequest;
import com.nexora.backend.dto.ProductAttributeValueResponse;
import com.nexora.backend.dto.ProductImageRequest;
import com.nexora.backend.dto.ProductImageResponse;
import com.nexora.backend.dto.PageResponse;
import com.nexora.backend.entity.Brand;
import com.nexora.backend.entity.Category;
import com.nexora.backend.entity.CategoryAttribute;
import com.nexora.backend.entity.Product;
import com.nexora.backend.entity.ProductAttributeValue;
import com.nexora.backend.entity.ProductImage;
import com.nexora.backend.repository.BrandRepository;
import com.nexora.backend.repository.CategoryAttributeRepository;
import com.nexora.backend.repository.CategoryRepository;
import com.nexora.backend.repository.ProductAttributeValueRepository;
import com.nexora.backend.repository.ProductImageRepository;
import com.nexora.backend.repository.ProductRepository;
import com.nexora.backend.repository.ProductSpecifications;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final ProductImageRepository productImageRepository;
    private final BrandRepository brandRepository;
    private final SlugService slugService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          CategoryAttributeRepository categoryAttributeRepository,
                          ProductAttributeValueRepository productAttributeValueRepository,
                          ProductImageRepository productImageRepository,
                          BrandRepository brandRepository,
                          SlugService slugService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.categoryAttributeRepository = categoryAttributeRepository;
        this.productAttributeValueRepository = productAttributeValueRepository;
        this.productImageRepository = productImageRepository;
        this.brandRepository = brandRepository;
        this.slugService = slugService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(String search, Long categoryId, Long brandId,
                                                BigDecimal minPrice, BigDecimal maxPrice, Boolean active,
                                                Long attributeId, String valueText,
                                                BigDecimal valueNumber, Boolean valueBoolean,
                                                int page, int size, String sortBy, String sortDirection) {
        if (page < 0 || size < 1 || size > 100) {
            throw badRequest("Page must be non-negative and size must be between 1 and 100");
        }
        if (minPrice != null && minPrice.signum() < 0
                || maxPrice != null && maxPrice.signum() < 0
                || minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw badRequest("Price range is invalid");
        }
        Set<String> sortableFields = Set.of("id", "name", "price", "createdAt", "updatedAt");
        if (!sortableFields.contains(sortBy)) {
            throw badRequest("Unsupported sort field");
        }
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDirection);
        } catch (IllegalArgumentException exception) {
            throw badRequest("Sort direction must be ASC or DESC");
        }
        if (attributeId != null) {
            CategoryAttribute attribute = categoryAttributeRepository.findById(attributeId)
                    .orElseThrow(() -> badRequest("Unknown category attribute"));
            if (!attribute.isFilterable()) {
                throw badRequest("Category attribute is not filterable");
            }
        }

        var productPage = productRepository.findAll(
                ProductSpecifications.filter(search, categoryId, brandId, minPrice, maxPrice,
                        active, attributeId, valueText, valueNumber, valueBoolean),
                PageRequest.of(page, size, Sort.by(direction, sortBy))
        );
        List<Product> products = productPage.getContent();
        List<Long> productIds = products.stream().map(Product::getId).toList();
        Map<Long, List<ProductAttributeValueResponse>> attributesByProduct = productIds.isEmpty()
                ? Map.of()
                : productAttributeValueRepository
                .findAllByProductIdInOrderByProductIdAscAttribute_DisplayOrderAsc(productIds).stream()
                .collect(Collectors.groupingBy(value -> value.getProduct().getId(),
                        Collectors.mapping(ProductAttributeValueResponse::from, Collectors.toList())));
        Map<Long, List<ProductImageResponse>> imagesByProduct = productIds.isEmpty()
                ? Map.of()
                : productImageRepository.findAllByProductIdInOrderByProductIdAscDisplayOrderAsc(productIds).stream()
                .collect(Collectors.groupingBy(image -> image.getProduct().getId(),
                        Collectors.mapping(ProductImageResponse::from, Collectors.toList())));
        var responsePage = productPage.map(product -> ProductResponse.from(
                product,
                attributesByProduct.getOrDefault(product.getId(), List.of()),
                imagesByProduct.getOrDefault(product.getId(), List.of())
        ));
        return PageResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return toResponse(getProduct(id));
    }

    @Transactional(readOnly = true)
    public List<ProductAttributeValueResponse> findAttributes(Long productId) {
        getProduct(productId);
        return productAttributeValueRepository
                .findAllByProductIdOrderByAttribute_DisplayOrderAsc(productId).stream()
                .map(ProductAttributeValueResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductAttributeValueResponse findAttribute(Long productId, Long attributeId) {
        getProduct(productId);
        ProductAttributeValue value = productAttributeValueRepository
                .findByProductIdAndAttributeId(productId, attributeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product attribute value not found"));
        return ProductAttributeValueResponse.from(value);
    }

    @Transactional
    public List<ProductAttributeValueResponse> replaceAttributes(Long productId,
                                                                 List<ProductAttributeValueRequest> requests) {
        Product product = getProduct(productId);
        replaceAttributes(product, requests);
        return findAttributes(productId);
    }

    @Transactional
    public ProductAttributeValueResponse updateAttribute(Long productId, Long attributeId,
                                                         ProductAttributeValueRequest request) {
        if (!attributeId.equals(request.attributeId())) {
            throw badRequest("Attribute id in the path and request body must match");
        }
        Product product = getProduct(productId);
        CategoryAttribute attribute = categoryAttributeRepository.findById(attributeId)
                .filter(item -> item.getCategory().getId().equals(product.getCategory().getId()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category attribute not found for product"));
        ProductAttributeValue value = toAttributeValue(product, request, Map.of(attributeId, attribute));
        ProductAttributeValue existing = productAttributeValueRepository
                .findByProductIdAndAttributeId(productId, attributeId).orElse(null);
        if (existing == null) {
            existing = value;
        } else {
            existing.updateValue(request.valueText(), request.valueNumber(), request.valueBoolean());
        }
        return ProductAttributeValueResponse.from(productAttributeValueRepository.save(existing));
    }

    @Transactional
    public void deleteAttribute(Long productId, Long attributeId) {
        getProduct(productId);
        ProductAttributeValue value = productAttributeValueRepository
                .findByProductIdAndAttributeId(productId, attributeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product attribute value not found"));
        productAttributeValueRepository.delete(value);
    }

    @Transactional(readOnly = true)
    public List<ProductImageResponse> findImages(Long productId) {
        getProduct(productId);
        return productImageRepository.findAllByProductIdOrderByDisplayOrder(productId).stream()
                .map(ProductImageResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductImageResponse findImage(Long productId, Long imageId) {
        return ProductImageResponse.from(getImage(productId, imageId));
    }

    @Transactional
    public ProductImageResponse createImage(Long productId, ProductImageRequest request) {
        Product product = getProduct(productId);
        validateImageOrder(productId, request.displayOrder(), null);
        if (request.primary()) {
            unsetPrimaryImage(productId, null);
        }
        ProductImage image = new ProductImage(product, request.imageUrl().trim(), request.altText(),
                request.displayOrder(), request.primary());
        return ProductImageResponse.from(productImageRepository.save(image));
    }

    @Transactional
    public ProductImageResponse updateImage(Long productId, Long imageId, ProductImageRequest request) {
        ProductImage image = getImage(productId, imageId);
        validateImageOrder(productId, request.displayOrder(), imageId);
        if (request.primary()) {
            unsetPrimaryImage(productId, imageId);
        }
        image.updateDetails(request.imageUrl().trim(), request.altText(), request.displayOrder(), request.primary());
        return ProductImageResponse.from(productImageRepository.save(image));
    }

    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        productImageRepository.delete(getImage(productId, imageId));
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
        Product savedProduct = productRepository.save(product);
        replaceAttributes(savedProduct, request.attributes() == null ? List.of() : request.attributes());
        replaceImages(savedProduct, request.images() == null ? List.of() : request.images());
        return toResponse(savedProduct);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProduct(id);
        Category category = getCategory(request.categoryId());
        boolean categoryChanged = !product.getCategory().getId().equals(category.getId());
        Brand brand = request.brandId() == null ? null : getBrand(request.brandId());
        String slug = request.slug() == null || request.slug().isBlank()
                ? slugService.toSlug(request.name()) : slugService.toSlug(request.slug());
        if (!slug.equals(product.getSlug()) && productRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product slug already exists");
        }
        if (categoryChanged) {
            clearAttributeValues(product);
        }
        product.updateDetails(
                category, brand, request.name().trim(), slug, request.description(),
                request.price(), request.active() == null ? true : request.active()
        );
        Product savedProduct = productRepository.save(product);
        if (request.attributes() != null || categoryChanged) {
            replaceAttributes(savedProduct, request.attributes() == null ? List.of() : request.attributes());
        }
        if (request.images() != null) {
            replaceImages(savedProduct, request.images());
        }
        return toResponse(savedProduct);
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

    private ProductResponse toResponse(Product product) {
        List<ProductAttributeValueResponse> attributes = productAttributeValueRepository
                .findAllByProductIdOrderByAttribute_DisplayOrderAsc(product.getId()).stream()
                .map(ProductAttributeValueResponse::from)
                .toList();
        List<ProductImageResponse> images = productImageRepository
                .findAllByProductIdOrderByDisplayOrder(product.getId()).stream()
                .map(ProductImageResponse::from)
                .toList();
        return ProductResponse.from(product, attributes, images);
    }

    private void replaceAttributes(Product product, List<ProductAttributeValueRequest> requests) {
        List<CategoryAttribute> categoryAttributes = categoryAttributeRepository
                .findAllByCategoryId(product.getCategory().getId());
        Map<Long, CategoryAttribute> attributesById = categoryAttributes.stream()
                .collect(Collectors.toMap(CategoryAttribute::getId, Function.identity()));
        Set<Long> requestedIds = requests.stream()
                .map(ProductAttributeValueRequest::attributeId)
                .collect(Collectors.toSet());
        if (requestedIds.size() != requests.size()) {
            throw badRequest("An attribute can only be provided once");
        }

        List<ProductAttributeValue> values = requests.stream()
                .map(request -> toAttributeValue(product, request, attributesById))
                .toList();
        boolean missingRequired = categoryAttributes.stream()
                .anyMatch(attribute -> attribute.isRequired() && !requestedIds.contains(attribute.getId()));
        if (missingRequired) {
            throw badRequest("All required category attributes must be provided");
        }

        productAttributeValueRepository.deleteAll(
                productAttributeValueRepository
                        .findAllByProductIdOrderByAttribute_DisplayOrderAsc(product.getId())
        );
        productAttributeValueRepository.flush();
        productAttributeValueRepository.saveAll(values);
    }

    private void clearAttributeValues(Product product) {
        productAttributeValueRepository.deleteAll(
                productAttributeValueRepository
                        .findAllByProductIdOrderByAttribute_DisplayOrderAsc(product.getId())
        );
        productAttributeValueRepository.flush();
    }

    private ProductAttributeValue toAttributeValue(Product product,
                                                   ProductAttributeValueRequest request,
                                                   Map<Long, CategoryAttribute> attributesById) {
        CategoryAttribute attribute = attributesById.get(request.attributeId());
        if (attribute == null) {
            throw badRequest("Attribute does not belong to the product category");
        }
        int setValues = (request.valueText() == null ? 0 : 1)
                + (request.valueNumber() == null ? 0 : 1)
                + (request.valueBoolean() == null ? 0 : 1);
        if (setValues != 1) {
            throw badRequest("Exactly one attribute value must be provided");
        }

        boolean validType = switch (attribute.getDataType()) {
            case TEXT -> request.valueText() != null && !request.valueText().isBlank();
            case SELECT -> request.valueText() != null && attribute.getOptions().contains(request.valueText());
            case NUMBER -> request.valueNumber() != null;
            case BOOLEAN -> request.valueBoolean() != null;
        };
        if (!validType) {
            throw badRequest("Attribute value does not match its type or allowed options");
        }
        return new ProductAttributeValue(
                product, attribute, request.valueText(), request.valueNumber(), request.valueBoolean()
        );
    }

    @Transactional
    public List<ProductImageResponse> replaceImages(Long productId, List<ProductImageRequest> requests) {
        Product product = getProduct(productId);
        replaceImages(product, requests);
        return findImages(productId);
    }

    private void replaceImages(Product product, List<ProductImageRequest> requests) {
        Set<Integer> displayOrders = requests.stream()
                .map(ProductImageRequest::displayOrder)
                .collect(Collectors.toSet());
        long primaryCount = requests.stream().filter(ProductImageRequest::primary).count();
        if (displayOrders.size() != requests.size()) {
            throw badRequest("Image display orders must be unique");
        }
        if (primaryCount > 1) {
            throw badRequest("A product can only have one primary image");
        }

        productImageRepository.deleteAll(
                productImageRepository.findAllByProductIdOrderByDisplayOrder(product.getId())
        );
        productImageRepository.flush();
        List<ProductImage> images = requests.stream()
                .map(request -> new ProductImage(product, request.imageUrl().trim(), request.altText(),
                        request.displayOrder(), request.primary()))
                .toList();
        productImageRepository.saveAll(images);
    }

    private ProductImage getImage(Long productId, Long imageId) {
        getProduct(productId);
        return productImageRepository.findById(imageId)
                .filter(image -> image.getProduct().getId().equals(productId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product image not found"));
    }

    private void validateImageOrder(Long productId, int displayOrder, Long exceptImageId) {
        if (displayOrder < 0) {
            throw badRequest("Image display order cannot be negative");
        }
        boolean used = productImageRepository.findByProductIdAndDisplayOrder(productId, displayOrder)
                .filter(image -> !image.getId().equals(exceptImageId))
                .isPresent();
        if (used) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Image display order already exists");
        }
    }

    private void unsetPrimaryImage(Long productId, Long exceptImageId) {
        productImageRepository.findByProductIdAndPrimaryTrue(productId)
                .filter(image -> !image.getId().equals(exceptImageId))
                .ifPresent(image -> {
                    image.updateDetails(image.getImageUrl(), image.getAltText(), image.getDisplayOrder(), false);
                    productImageRepository.save(image);
                    productImageRepository.flush();
                });
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
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
