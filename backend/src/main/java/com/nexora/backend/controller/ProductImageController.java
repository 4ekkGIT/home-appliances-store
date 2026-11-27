package com.nexora.backend.controller;

import com.nexora.backend.dto.ProductImageRequest;
import com.nexora.backend.dto.ProductImageResponse;
import com.nexora.backend.dto.ProductImagesRequest;
import com.nexora.backend.service.ImageStorageService;
import com.nexora.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products/{productId}/images")
public class ProductImageController {
    private final ProductService productService;
    private final ImageStorageService imageStorageService;

    public ProductImageController(ProductService productService, ImageStorageService imageStorageService) {
        this.productService = productService;
        this.imageStorageService = imageStorageService;
    }

    @GetMapping
    public List<ProductImageResponse> findAll(@PathVariable Long productId) {
        return productService.findImages(productId);
    }

    @GetMapping("/{imageId}")
    public ProductImageResponse findById(@PathVariable Long productId, @PathVariable Long imageId) {
        return productService.findImage(productId, imageId);
    }

    @PutMapping
    public List<ProductImageResponse> replace(@PathVariable Long productId,
                                              @Valid @RequestBody ProductImagesRequest request) {
        List<ProductImageResponse> previousImages = productService.findImages(productId);
        List<ProductImageResponse> updatedImages = productService.replaceImages(productId, request.images());
        Set<String> retainedUrls = updatedImages.stream()
            .map(ProductImageResponse::imageUrl)
            .collect(Collectors.toSet());
        previousImages.stream()
            .map(ProductImageResponse::imageUrl)
            .filter(url -> url.startsWith("/api/media/images/") && !retainedUrls.contains(url))
            .forEach(imageStorageService::delete);
        return updatedImages;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductImageResponse create(@PathVariable Long productId,
                                       @Valid @RequestBody ProductImageRequest request) {
        return productService.createImage(productId, request);
    }

    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ProductImageResponse upload(@PathVariable Long productId,
                                       @RequestPart("file") MultipartFile file) {
        String imageUrl = imageStorageService.store(file);
        try {
            List<ProductImageResponse> currentImages = productService.findImages(productId);
            int displayOrder = currentImages.stream()
                    .mapToInt(ProductImageResponse::displayOrder)
                    .max()
                    .orElse(-1) + 1;
            boolean primary = currentImages.stream().noneMatch(ProductImageResponse::primary);
            String originalName = file.getOriginalFilename();
            String altText = originalName == null ? "Product image" : originalName.replace('\\', '/');
            altText = altText.substring(altText.lastIndexOf('/') + 1);
            if (altText.length() > 200) altText = altText.substring(0, 200);
            return productService.createImage(productId,
                    new ProductImageRequest(imageUrl, altText, displayOrder, primary));
        } catch (RuntimeException exception) {
            imageStorageService.delete(imageUrl);
            throw exception;
        }
    }

    @PutMapping("/{imageId}")
    public ProductImageResponse update(@PathVariable Long productId, @PathVariable Long imageId,
                                       @Valid @RequestBody ProductImageRequest request) {
        return productService.updateImage(productId, imageId, request);
    }

    @DeleteMapping("/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long productId, @PathVariable Long imageId) {
        String imageUrl = productService.findImage(productId, imageId).imageUrl();
        productService.deleteImage(productId, imageId);
        if (imageUrl.startsWith("/api/media/images/")) imageStorageService.delete(imageUrl);
    }
}
