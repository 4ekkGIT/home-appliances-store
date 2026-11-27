package com.nexora.backend;

import com.jayway.jsonpath.JsonPath;
import com.nexora.backend.entity.StoreUser;
import com.nexora.backend.repository.StoreUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CatalogApiIntegrationTests {
    private static final String PASSWORD = "IntegrationPassword123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StoreUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

        @Autowired
        private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private JavaMailSender mailSender;

    @Test
    void adminCanManageCategoryAttributesProductsImagesAndSearch() throws Exception {
        String adminEmail = createUser(StoreUser.Role.ADMIN);

        String categoryResponse = mockMvc.perform(post("/api/categories")
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"API Category %s","slug":"api-category-%s",
                                 "imageUrl":"https://example.com/category.jpg"}
                                """.formatted(UUID.randomUUID(), UUID.randomUUID())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.imageUrl").value("https://example.com/category.jpg"))
                .andReturn().getResponse().getContentAsString();
        int categoryId = JsonPath.read(categoryResponse, "$.id");

        mockMvc.perform(put("/api/categories/{id}", categoryId)
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Updated API Category","slug":"updated-api-category",
                                 "description":"Updated category","imageUrl":"https://example.com/category-updated.jpg"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value("https://example.com/category-updated.jpg"));

        String attributeBody = """
                {"name":"Capacity","slug":"capacity","dataType":"NUMBER","unit":"L",
                 "options":[],"required":true,"filterable":true,"displayOrder":0}
                """;
        String attributeResponse = mockMvc.perform(post("/api/categories/{id}/attributes", categoryId)
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(attributeBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        int attributeId = JsonPath.read(attributeResponse, "$.id");

        mockMvc.perform(get("/api/categories/{id}/attributes", categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("capacity"));
        mockMvc.perform(get("/api/categories/{categoryId}/attributes/{attributeId}", categoryId, attributeId))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/categories/{categoryId}/attributes/{attributeId}", categoryId, attributeId)
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Capacity","slug":"capacity","dataType":"NUMBER","unit":"liters",
                                 "options":[],"required":true,"filterable":true,"displayOrder":1}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unit").value("liters"));

        String productBody = """
                {"categoryId":%d,"name":"API Product %s","slug":"api-product-%s",
                 "description":"Integration search target","price":150,"active":true,
                 "attributes":[{"attributeId":%d,"valueNumber":50}],
                 "images":[{"imageUrl":"https://example.com/main.jpg","altText":"Main",
                            "displayOrder":0,"primary":true}]}
                """.formatted(categoryId, UUID.randomUUID(), UUID.randomUUID(), attributeId);
        String productResponse = mockMvc.perform(post("/api/products")
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.attributes[0].valueNumber").value(50))
                .andExpect(jsonPath("$.images[0].primary").value(true))
                .andReturn().getResponse().getContentAsString();
        int productId = JsonPath.read(productResponse, "$.id");
        int imageId = JsonPath.read(productResponse, "$.images[0].id");

        String warehouseResponse = mockMvc.perform(get("/api/warehouses"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        int warehouseId = JsonPath.read(warehouseResponse, "$[0].id");
        String unitResponse = mockMvc.perform(post("/api/inventory/units")
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":%d,"warehouseId":%d}
                                """.formatted(productId, warehouseId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        int unitId = JsonPath.read(unitResponse, "$.id");

        mockMvc.perform(get("/api/products")
                        .param("q", "Integration search target")
                        .param("categoryId", String.valueOf(categoryId))
                        .param("minPrice", "100")
                        .param("maxPrice", "200")
                        .param("active", "true")
                        .param("attributeId", String.valueOf(attributeId))
                        .param("valueNumber", "50")
                        .param("page", "0")
                        .param("size", "5")
                        .param("sortBy", "price")
                        .param("sortDirection", "DESC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(productId))
                .andExpect(jsonPath("$.size").value(5));

        mockMvc.perform(get("/api/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attributes[0].name").value("Capacity"));
        mockMvc.perform(get("/api/products/{id}/attributes", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].valueNumber").value(50));
        mockMvc.perform(get("/api/products/{id}/attributes/{attributeId}", productId, attributeId))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/products/{id}/attributes/{attributeId}", productId, attributeId)
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"attributeId":%d,"valueNumber":60}
                                """.formatted(attributeId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valueNumber").value(60));
        mockMvc.perform(put("/api/products/{id}/attributes", productId)
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"attributes":[{"attributeId":%d,"valueNumber":70}]}
                                """.formatted(attributeId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].valueNumber").value(70));

        mockMvc.perform(get("/api/products/{id}/images", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(imageId));
        mockMvc.perform(get("/api/products/{id}/images/{imageId}", productId, imageId))
                .andExpect(status().isOk());
        String extraImage = """
                {"imageUrl":"https://example.com/extra.jpg","altText":"Extra",
                 "displayOrder":1,"primary":false}
                """;
        String createdImageResponse = mockMvc.perform(post("/api/products/{id}/images", productId)
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(extraImage))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        int extraImageId = JsonPath.read(createdImageResponse, "$.id");
        mockMvc.perform(put("/api/products/{id}/images/{imageId}", productId, extraImageId)
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"imageUrl":"https://example.com/updated.jpg","altText":"Updated",
                                 "displayOrder":1,"primary":true}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.primary").value(true));
        mockMvc.perform(put("/api/products/{id}/images", productId)
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"images":[
                                  {"imageUrl":"https://example.com/final.jpg","altText":"Final",
                                   "displayOrder":0,"primary":true}
                                ]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].altText").value("Final"));

        mockMvc.perform(put("/api/products/{id}", productId)
                        .with(authenticatedAs(adminEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"categoryId":%d,"name":"Updated API Product","slug":"updated-api-product",
                                 "description":"Updated product parameters","price":175,"active":true,
                                 "images":[{"imageUrl":"https://example.com/updated-product.jpg",
                                            "altText":"Updated product","displayOrder":0,"primary":true}]}
                                """.formatted(categoryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated API Product"))
                .andExpect(jsonPath("$.price").value(175))
                .andExpect(jsonPath("$.images[0].imageUrl").value("https://example.com/updated-product.jpg"));

        if (userRepository.findByEmailIgnoreCase(adminEmail).isEmpty()) {
            throw new AssertionError("Admin account disappeared during catalog operations");
        }
        mockMvc.perform(get("/api/auth/me").with(authenticatedAs(adminEmail)))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/categories/{categoryId}/attributes/{attributeId}", categoryId, attributeId)
                        .with(authenticatedAs(adminEmail)))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/products/{id}/permanent", productId)
                        .with(authenticatedAs(adminEmail)))
                .andExpect(status().isNoContent());
        org.junit.jupiter.api.Assertions.assertEquals(0L,
                jdbcTemplate.queryForObject("SELECT count(*) FROM product_units WHERE id = ?", Long.class, unitId));
        org.junit.jupiter.api.Assertions.assertEquals(0L,
                jdbcTemplate.queryForObject("SELECT count(*) FROM inventory_movements WHERE product_unit_id = ?",
                        Long.class, unitId));
        mockMvc.perform(get("/api/products/{id}", productId))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/categories/{id}", categoryId)
                        .with(authenticatedAs(adminEmail)))
                .andExpect(status().isNoContent());
        userRepository.deleteByEmailIgnoreCase(adminEmail);
    }

    @Test
    void publicRegistrationCreatesCustomerAndOnlyAdminCanWriteCatalog() throws Exception {
        String email = "customer-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"Test Customer","email":"%s","password":"%s"}
                                """.formatted(email, PASSWORD)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        mockMvc.perform(get("/api/auth/me").with(authenticatedAs(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_CUSTOMER"));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/categories")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Unauthenticated Category","slug":"unauthenticated-category"}
                                """))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/categories")
                        .with(authenticatedAs(email))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Customer Category","slug":"customer-category"}
                                """))
                .andExpect(status().isForbidden());
        userRepository.deleteByEmailIgnoreCase(email);
    }

    @Test
    void sessionLoginPersistsAndLogoutInvalidatesSessionAndRequiresCsrf() throws Exception {
        String email = createUser(StoreUser.Role.CUSTOMER);
        MvcResult csrfResult = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andReturn();
        String csrfToken = JsonPath.read(csrfResult.getResponse().getContentAsString(), "$.token");
        MockHttpSession csrfSession = (MockHttpSession) csrfResult.getRequest().getSession(false);
        String anonymousSessionId = csrfSession.getId();

        mockMvc.perform(post("/api/auth/login")
                        .session(csrfSession)
                        .header("X-XSRF-TOKEN", csrfToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"wrong-password"}
                                """.formatted(email)))
                .andExpect(status().isUnauthorized());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .session(csrfSession)
                        .header("X-XSRF-TOKEN", csrfToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andReturn();
        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);
        org.junit.jupiter.api.Assertions.assertNotEquals(anonymousSessionId, session.getId());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roles[0]").value("ROLE_CUSTOMER"));
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
        String basicCredentials = Base64.getEncoder().encodeToString(
                (email + ":" + PASSWORD).getBytes(StandardCharsets.UTF_8));
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Basic " + basicCredentials))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/logout").session(session))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/auth/logout")
                        .session(session)
                        .header("X-XSRF-TOKEN", csrfToken))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registrationRejectsDuplicateEmailCaseInsensitively() throws Exception {
        String email = "duplicate-" + UUID.randomUUID() + "@example.com";
        register(email);
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"Duplicate","email":"%s","password":"%s"}
                                """.formatted(email.toUpperCase(), PASSWORD)))
                .andExpect(status().isConflict());
        userRepository.deleteByEmailIgnoreCase(email);
    }

    @Test
    void apiRejectsInvalidInputsAndReturnsNotFoundOrConflictForBoundaryCases() throws Exception {
        String adminEmail = createUser(StoreUser.Role.ADMIN);
        Integer categoryId = null;
        Integer attributeId = null;
        Integer productId = null;

        try {
            mockMvc.perform(get("/api/products").param("page", "-1"))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(get("/api/products").param("size", "0"))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(get("/api/products").param("size", "101"))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(get("/api/products").param("sortBy", "unknown"))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(get("/api/products").param("sortDirection", "sideways"))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(get("/api/products")
                            .param("minPrice", "100")
                            .param("maxPrice", "99.99"))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(get("/api/products/not-a-number"))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(get("/api/products/999999999"))
                    .andExpect(status().isNotFound());

            mockMvc.perform(post("/api/products")
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"categoryId":1,"name":"Invalid price","price":-0.01}
                                    """))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(post("/api/products")
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"categoryId":999999999,"name":"Missing category","price":1}
                                    """))
                    .andExpect(status().isNotFound());

            String categoryBody = """
                    {"name":"Boundary Category %s","slug":"boundary-category-%s"}
                    """.formatted(UUID.randomUUID(), UUID.randomUUID());
            String categoryResponse = mockMvc.perform(post("/api/categories")
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(categoryBody))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();
            categoryId = JsonPath.read(categoryResponse, "$.id");

            mockMvc.perform(post("/api/categories/{id}/attributes", categoryId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"name":"Choice","dataType":"SELECT","options":[]}
                                    """))
                    .andExpect(status().isBadRequest());

            String attributeBody = """
                    {"name":"Capacity","slug":"capacity","dataType":"NUMBER","options":[],
                     "required":false,"filterable":true,"displayOrder":0}
                    """;
            String attributeResponse = mockMvc.perform(post("/api/categories/{id}/attributes", categoryId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(attributeBody))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();
            attributeId = JsonPath.read(attributeResponse, "$.id");

            mockMvc.perform(post("/api/categories/{id}/attributes", categoryId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(attributeBody))
                    .andExpect(status().isConflict());
            mockMvc.perform(get("/api/categories/{categoryId}/attributes/{attributeId}",
                            categoryId, 999999999))
                    .andExpect(status().isNotFound());

            mockMvc.perform(post("/api/products")
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"categoryId":%d,"name":"Wrong attribute type","price":1,
                                     "attributes":[{"attributeId":%d,"valueText":"wrong"}]}
                                    """.formatted(categoryId, attributeId)))
                    .andExpect(status().isBadRequest());

            String productResponse = mockMvc.perform(post("/api/products")
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"categoryId":%d,"name":"Boundary Product %s","price":0,
                                     "images":[{"imageUrl":"https://example.com/primary.jpg",
                                                "displayOrder":0,"primary":true}]}
                                    """.formatted(categoryId, UUID.randomUUID())))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();
            productId = JsonPath.read(productResponse, "$.id");

            mockMvc.perform(get("/api/products/{id}", 999999999))
                    .andExpect(status().isNotFound());
            mockMvc.perform(post("/api/products/{id}/images", productId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"imageUrl":"https://example.com/duplicate.jpg",
                                     "displayOrder":0,"primary":false}
                                    """))
                    .andExpect(status().isConflict());
            mockMvc.perform(put("/api/products/{id}/images", productId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"images":[
                                      {"imageUrl":"https://example.com/first.jpg","displayOrder":0,"primary":true},
                                      {"imageUrl":"https://example.com/second.jpg","displayOrder":0,"primary":false}
                                    ]}
                                    """))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(put("/api/products/{id}/images", productId)
                            .with(authenticatedAs(adminEmail))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"images":[
                                      {"imageUrl":"https://example.com/first.jpg","displayOrder":0,"primary":true},
                                      {"imageUrl":"https://example.com/second.jpg","displayOrder":1,"primary":true}
                                    ]}
                                    """))
                    .andExpect(status().isBadRequest());
            mockMvc.perform(get("/api/products/{id}/images/{imageId}", productId, 999999999))
                    .andExpect(status().isNotFound());
        } finally {
            if (productId != null) {
                mockMvc.perform(delete("/api/products/{id}", productId)
                                .with(authenticatedAs(adminEmail)))
                        .andExpect(status().isNoContent());
            }
            if (attributeId != null) {
                mockMvc.perform(delete("/api/categories/{categoryId}/attributes/{attributeId}",
                                categoryId, attributeId)
                                .with(authenticatedAs(adminEmail)))
                        .andExpect(status().isNoContent());
            }
            if (categoryId != null) {
                mockMvc.perform(delete("/api/categories/{id}", categoryId)
                                .with(authenticatedAs(adminEmail)))
                        .andExpect(status().isNoContent());
            }
            userRepository.deleteByEmailIgnoreCase(adminEmail);
        }
    }

    private String createUser(StoreUser.Role role) {
        String email = role.name().toLowerCase() + "-" + UUID.randomUUID() + "@example.com";
        StoreUser user = new StoreUser("Test", null, email,
                passwordEncoder.encode(PASSWORD), null, role);
        if (role == StoreUser.Role.CUSTOMER) {
            user.verifyEmail();
        }
        userRepository.saveAndFlush(user);
        return email;
    }

    private RequestPostProcessor authenticatedAs(String email) {
        StoreUser storeUser = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        return request -> csrf().postProcessRequest(
                user(email).roles(storeUser.getRole().name()).postProcessRequest(request));
    }

    private void register(String email) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"Test","email":"%s","password":"%s"}
                                """.formatted(email, PASSWORD)))
                .andExpect(status().isCreated());
    }
}
