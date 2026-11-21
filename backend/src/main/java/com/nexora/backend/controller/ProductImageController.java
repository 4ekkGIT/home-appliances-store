package com.nexora.backend.controller;

import com.nexora.backend.dto.ProductImageRequest;
import com.nexora.backend.dto.ProductImageResponse;
import com.nexora.backend.dto.ProductImagesRequest;
import com.nexora.backend.service.ProductService;
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
@RequestMapping("/api/products/{productId}/images")
public class ProductImageController {
    private final ProductService productService;

    public ProductImageController(ProductService productService) {
        this.productService = productService;
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
        return productService.replaceImages(productId, request.images());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductImageResponse create(@PathVariable Long productId,
                                       @Valid @RequestBody ProductImageRequest request) {
        return productService.createImage(productId, request);
    }

    @PutMapping("/{imageId}")
    public ProductImageResponse update(@PathVariable Long productId, @PathVariable Long imageId,
                                       @Valid @RequestBody ProductImageRequest request) {
        return productService.updateImage(productId, imageId, request);
    }

    @DeleteMapping("/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long productId, @PathVariable Long imageId) {
        productService.deleteImage(productId, imageId);
    }
}
