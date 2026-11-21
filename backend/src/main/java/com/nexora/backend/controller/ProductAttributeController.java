package com.nexora.backend.controller;

import com.nexora.backend.dto.ProductAttributeValueRequest;
import com.nexora.backend.dto.ProductAttributeValueResponse;
import com.nexora.backend.dto.ProductAttributeValuesRequest;
import com.nexora.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/attributes")
public class ProductAttributeController {
    private final ProductService productService;

    public ProductAttributeController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductAttributeValueResponse> findAll(@PathVariable Long productId) {
        return productService.findAttributes(productId);
    }

    @GetMapping("/{attributeId}")
    public ProductAttributeValueResponse findById(@PathVariable Long productId,
                                                  @PathVariable Long attributeId) {
        return productService.findAttribute(productId, attributeId);
    }

    @PutMapping
    public List<ProductAttributeValueResponse> replace(@PathVariable Long productId,
                                                       @Valid @RequestBody ProductAttributeValuesRequest request) {
        return productService.replaceAttributes(productId, request.attributes());
    }

    @PutMapping("/{attributeId}")
    public ProductAttributeValueResponse update(@PathVariable Long productId,
                                                @PathVariable Long attributeId,
                                                @Valid @RequestBody ProductAttributeValueRequest request) {
        return productService.updateAttribute(productId, attributeId, request);
    }

    @DeleteMapping("/{attributeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long productId, @PathVariable Long attributeId) {
        productService.deleteAttribute(productId, attributeId);
    }
}
