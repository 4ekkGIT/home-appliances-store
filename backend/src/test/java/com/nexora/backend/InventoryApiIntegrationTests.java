package com.nexora.backend;

import com.jayway.jsonpath.JsonPath;
import com.nexora.backend.entity.Category;
import com.nexora.backend.entity.Product;
import com.nexora.backend.entity.StoreUser;
import com.nexora.backend.entity.Warehouse;
import com.nexora.backend.repository.CategoryRepository;
import com.nexora.backend.repository.InventoryMovementRepository;
import com.nexora.backend.repository.ProductRepository;
import com.nexora.backend.repository.ProductUnitRepository;
import com.nexora.backend.repository.StoreUserRepository;
import com.nexora.backend.repository.WarehouseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InventoryApiIntegrationTests {
    private static final String PASSWORD = "InventoryPassword123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StoreUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductUnitRepository unitRepository;

    @Autowired
    private InventoryMovementRepository movementRepository;

    private RequestPostProcessor authenticatedAs(String email) {
        return request -> csrf().postProcessRequest(
                user(email).roles("ADMIN").postProcessRequest(request));
    }

    @Test
    void managesRegistrationTransferStatusAndAvailableStock() throws Exception {
        String adminEmail = "inventory-admin-" + UUID.randomUUID() + "@example.com";
        Long unitId = null;
        userRepository.saveAndFlush(new StoreUser(
                "Inventory", "Admin", adminEmail,
                passwordEncoder.encode(PASSWORD), null, StoreUser.Role.ADMIN
        ));

        String suffix = UUID.randomUUID().toString();
        Category category = categoryRepository.saveAndFlush(
                new Category("Inventory Category " + suffix,
                        "inventory-category-" + suffix, null)
        );
        Product product = productRepository.saveAndFlush(
                new Product(category, null, "Inventory Product " + suffix,
                        "inventory-product-" + suffix, null, new BigDecimal("999.00"))
        );
        Warehouse source = warehouseRepository.saveAndFlush(
                new Warehouse("Inventory Source " + suffix, "Source address")
        );
        Warehouse destination = warehouseRepository.saveAndFlush(
                new Warehouse("Inventory Destination " + suffix, "Destination address")
        );

        try {
            mockMvc.perform(get("/api/inventory/units"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
            mockMvc.perform(get("/api/warehouses"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
            mockMvc.perform(get("/api/warehouses/{id}", source.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(source.getId()));

            String registerResponse = mockMvc.perform(post("/api/inventory/units")
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"productId":%d,"warehouseId":%d,"serialNumber":"SN-%s"}
                                    """.formatted(product.getId(), source.getId(), suffix)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.inventoryCode").exists())
                    .andExpect(jsonPath("$.status").value("AVAILABLE"))
                    .andReturn().getResponse().getContentAsString();
            unitId = ((Number) JsonPath.read(registerResponse, "$.id")).longValue();

            mockMvc.perform(get("/api/inventory/available")
                            .param("productId", product.getId().toString())
                            .param("warehouseId", source.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.availableQuantity").value(1));

            mockMvc.perform(post("/api/inventory/units/{id}/transfer", unitId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"toWarehouseId":%d,"comment":"Between warehouses"}
                                    """.formatted(destination.getId())))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.warehouseId").value(destination.getId()));

            mockMvc.perform(post("/api/inventory/units/{id}/status", unitId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"status":"RESERVED","comment":"Customer reservation"}
                                    """))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("RESERVED"));

            mockMvc.perform(post("/api/inventory/units/{id}/status", unitId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"status":"AVAILABLE","comment":"Release reservation"}
                                    """))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("AVAILABLE"));

            mockMvc.perform(post("/api/inventory/units/{id}/status", unitId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"status":"WRITTEN_OFF","comment":"Warehouse write-off"}
                                    """))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("WRITTEN_OFF"));

            mockMvc.perform(post("/api/inventory/units/{id}/status", unitId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"status":"AVAILABLE","comment":"Invalid restore"}
                                    """))
                    .andExpect(status().isBadRequest());

            mockMvc.perform(post("/api/inventory/units/{id}/transfer", unitId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"toWarehouseId":%d}
                                    """.formatted(source.getId())))
                    .andExpect(status().isBadRequest());

            mockMvc.perform(get("/api/inventory/units/{id}/movements", unitId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            mockMvc.perform(get("/api/inventory/available")
                            .param("productId", product.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.availableQuantity").value(0));
        } finally {
            if (unitId != null) {
                movementRepository.deleteAll(
                        movementRepository.findByProductUnitIdOrderByCreatedAtDesc(unitId)
                );
                unitRepository.findById(unitId).ifPresent(unitRepository::delete);
            }
            productRepository.delete(product);
            warehouseRepository.delete(destination);
            warehouseRepository.delete(source);
            categoryRepository.delete(category);
            userRepository.deleteByEmailIgnoreCase(adminEmail);
        }
    }
}
