package com.nexora.backend;

import com.nexora.backend.dto.BrandRequest;
import com.nexora.backend.dto.CategoryRequest;
import com.nexora.backend.service.BrandService;
import com.nexora.backend.service.CategoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class CatalogServiceTests {
    @Autowired
    private BrandService brandService;

    @Autowired
    private CategoryService categoryService;

    @Test
    void brandCreationRejectsDuplicateSlug() {
        brandService.create(new BrandRequest("Brand One", "shared-brand-slug", null));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> brandService.create(new BrandRequest("Brand Two", "shared-brand-slug", null))
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void brandUpdateRejectsDuplicateName() {
        brandService.create(new BrandRequest("Existing Brand", "existing-brand", null));
        Long brandId = brandService.create(
                new BrandRequest("Another Brand", "another-brand", null)
        ).id();

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> brandService.update(
                        brandId,
                        new BrandRequest("Existing Brand", "renamed-brand", null)
                )
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void brandUpdateRejectsDuplicateSlug() {
        brandService.create(new BrandRequest("Existing Brand", "existing-brand", null));
        Long brandId = brandService.create(
                new BrandRequest("Another Brand", "another-brand", null)
        ).id();

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> brandService.update(
                        brandId,
                        new BrandRequest("Renamed Brand", "existing-brand", null)
                )
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void categoryCreationRejectsDuplicateSlug() {
        categoryService.create(new CategoryRequest("Category One", "shared-category-slug", null));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> categoryService.create(
                        new CategoryRequest("Category Two", "shared-category-slug", null)
                )
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void categoryUpdateRejectsDuplicateName() {
        categoryService.create(new CategoryRequest("Existing Category", "existing-category", null));
        Long categoryId = categoryService.create(
                new CategoryRequest("Another Category", "another-category", null)
        ).id();

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> categoryService.update(
                        categoryId,
                        new CategoryRequest("Existing Category", "renamed-category", null)
                )
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    @Test
    void categoryUpdateRejectsDuplicateSlug() {
        categoryService.create(new CategoryRequest("Existing Category", "existing-category", null));
        Long categoryId = categoryService.create(
                new CategoryRequest("Another Category", "another-category", null)
        ).id();

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> categoryService.update(
                        categoryId,
                        new CategoryRequest("Renamed Category", "existing-category", null)
                )
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }
}
