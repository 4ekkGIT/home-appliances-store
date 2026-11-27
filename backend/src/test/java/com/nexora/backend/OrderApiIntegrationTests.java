package com.nexora.backend;

import com.nexora.backend.entity.Category;
import com.nexora.backend.entity.Product;
import com.nexora.backend.entity.ProductUnit;
import com.nexora.backend.entity.StoreUser;
import com.nexora.backend.entity.Warehouse;
import com.nexora.backend.repository.CategoryRepository;
import com.nexora.backend.repository.ProductRepository;
import com.nexora.backend.repository.ProductUnitRepository;
import com.nexora.backend.repository.StoreUserRepository;
import com.nexora.backend.repository.WarehouseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrderApiIntegrationTests {
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
    private ProductUnitRepository unitRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private RequestPostProcessor authenticatedCustomer(String email) {
        return request -> csrf().postProcessRequest(
                user(email).roles("CUSTOMER").postProcessRequest(request));
    }

        private RequestPostProcessor authenticatedAdmin() {
                return request -> csrf().postProcessRequest(user("catalog-admin@example.com").roles("ADMIN")
                                .postProcessRequest(request));
        }

    @Test
    void createsOrderAndReservesStockThenRejectsAnUnavailableItem() throws Exception {
        String suffix = UUID.randomUUID().toString();
        String email = "checkout-" + suffix + "@example.com";
        StoreUser customer = userRepository.saveAndFlush(new StoreUser(
                "Checkout", "Customer", email, passwordEncoder.encode("CheckoutPassword123"),
                null, StoreUser.Role.CUSTOMER));
        Category category = categoryRepository.saveAndFlush(new Category(
                "Checkout Category " + suffix, "checkout-category-" + suffix, null));
        Product product = productRepository.saveAndFlush(new Product(
                category, null, "Checkout Product " + suffix, "checkout-product-" + suffix,
                null, new BigDecimal("10.00")));
        Warehouse warehouse = warehouseRepository.saveAndFlush(new Warehouse(
                "Checkout Warehouse " + suffix, "Checkout address"));
        ProductUnit unit = unitRepository.saveAndFlush(new ProductUnit(
                product, warehouse, "CHECKOUT-" + suffix, null));

        String orderBody = """
                {
                  "items": [{"productId": %d, "quantity": 1}],
                  "address": {
                    "contactName": "Test Customer",
                    "email": "%s",
                    "phone": "+1 555 123 4567",
                    "street": "Main Street",
                    "building": "12",
                    "apartment": "4B",
                    "city": "Springfield",
                    "postalCode": "12345",
                    "country": "United States"
                  }
                }
                """.formatted(product.getId(), email);

        try {
            mockMvc.perform(post("/api/orders")
                            .with(authenticatedCustomer(email))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(orderBody))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.subtotal").value(10.00))
                    .andExpect(jsonPath("$.deliveryFee").value(10.00))
                    .andExpect(jsonPath("$.total").value(20.00));

            mockMvc.perform(get("/api/inventory/available")
                            .param("productId", product.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.availableQuantity").value(0));

            mockMvc.perform(post("/api/orders")
                            .with(authenticatedCustomer(email))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(orderBody))
                    .andExpect(status().isConflict());

            org.junit.jupiter.api.Assertions.assertEquals(
                    ProductUnit.Status.RESERVED, unitRepository.findById(unit.getId()).orElseThrow().getStatus());

            mockMvc.perform(delete("/api/products/{id}/permanent", product.getId())
                            .with(authenticatedAdmin()))
                    .andExpect(status().isConflict());

            Long orderId = jdbcTemplate.queryForObject(
                    "SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1", Long.class, customer.getId());
            mockMvc.perform(put("/api/orders/{id}/status", orderId)
                            .with(authenticatedAdmin())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\":\"CANCELLED\"}"))
                    .andExpect(status().isOk());

            mockMvc.perform(delete("/api/products/{id}", product.getId())
                            .with(authenticatedAdmin()))
                    .andExpect(status().isNoContent());
            org.junit.jupiter.api.Assertions.assertFalse(
                    productRepository.findById(product.getId()).orElseThrow().getActive());
            mockMvc.perform(delete("/api/products/{id}/permanent", product.getId())
                            .with(authenticatedAdmin()))
                    .andExpect(status().isNoContent());
            org.junit.jupiter.api.Assertions.assertFalse(productRepository.existsById(product.getId()));
            org.junit.jupiter.api.Assertions.assertEquals(0L,
                    jdbcTemplate.queryForObject("SELECT count(*) FROM product_units WHERE product_id = ?",
                            Long.class, product.getId()));
            org.junit.jupiter.api.Assertions.assertEquals(1L,
                    jdbcTemplate.queryForObject("SELECT count(*) FROM order_items " +
                                    "WHERE order_id = ? AND product_id IS NULL AND product_name = ? " +
                                    "AND quantity = 1 AND unit_price = 10.00",
                            Long.class, orderId, product.getName()));
            org.junit.jupiter.api.Assertions.assertEquals(1L,
                    jdbcTemplate.queryForObject("SELECT count(*) FROM orders WHERE user_id = ?",
                            Long.class, customer.getId()));
        } finally {
            jdbcTemplate.update("DELETE FROM inventory_movements WHERE order_id IN " +
                    "(SELECT id FROM orders WHERE user_id = ?)", customer.getId());
            jdbcTemplate.update("DELETE FROM order_item_units WHERE order_item_id IN " +
                    "(SELECT oi.id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = ?)",
                    customer.getId());
            jdbcTemplate.update("DELETE FROM order_items WHERE order_id IN " +
                    "(SELECT id FROM orders WHERE user_id = ?)", customer.getId());
            jdbcTemplate.update("DELETE FROM orders WHERE user_id = ?", customer.getId());
            jdbcTemplate.update("DELETE FROM inventory_movements WHERE product_unit_id IN " +
                    "(SELECT id FROM product_units WHERE product_id = ?)", product.getId());
            jdbcTemplate.update("DELETE FROM product_units WHERE product_id = ?", product.getId());
            jdbcTemplate.update("DELETE FROM products WHERE id = ?", product.getId());
            warehouseRepository.delete(warehouse);
            categoryRepository.delete(category);
            userRepository.deleteByEmailIgnoreCase(email);
        }
    }

    @Test
    void adminCanReviewOrdersAndCancelToReleaseReservedStock() throws Exception {
        String suffix = UUID.randomUUID().toString();
        String email = "admin-order-" + suffix + "@example.com";
        StoreUser customer = userRepository.saveAndFlush(new StoreUser(
                "Admin", "Order", email, passwordEncoder.encode("CheckoutPassword123"),
                null, StoreUser.Role.CUSTOMER));
        Category category = categoryRepository.saveAndFlush(new Category(
                "Admin Order Category " + suffix, "admin-order-category-" + suffix, null));
        Product product = productRepository.saveAndFlush(new Product(
                category, null, "Admin Order Product " + suffix, "admin-order-product-" + suffix,
                null, new BigDecimal("15.00")));
        Warehouse warehouse = warehouseRepository.saveAndFlush(new Warehouse(
                "Admin Order Warehouse " + suffix, "Admin order address"));
        ProductUnit unit = unitRepository.saveAndFlush(new ProductUnit(
                product, warehouse, "ADMIN-ORDER-" + suffix, null));
        String orderBody = """
                {
                  "items": [{"productId": %d, "quantity": 1}],
                  "address": {
                    "contactName": "Test Customer", "email": "%s", "phone": "+1 555 123 4567",
                    "street": "Main Street", "building": "12", "apartment": "",
                    "city": "Springfield", "postalCode": "12345", "country": "United States"
                  }
                }
                """.formatted(product.getId(), email);

        try {
            mockMvc.perform(post("/api/orders")
                            .with(authenticatedCustomer(email))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(orderBody))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/orders").with(authenticatedCustomer(email)))
                    .andExpect(status().isForbidden());

            mockMvc.perform(get("/api/orders").with(authenticatedAdmin()))
                    .andExpect(status().isOk())
                    .andExpect(content().string(org.hamcrest.Matchers.containsString(email)));

            Long orderId = jdbcTemplate.queryForObject(
                    "SELECT id FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1", Long.class, customer.getId());
            mockMvc.perform(put("/api/orders/{id}/status", orderId)
                            .with(authenticatedAdmin())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\":\"DELIVERED\"}"))
                    .andExpect(status().isBadRequest());

            mockMvc.perform(put("/api/orders/{id}/status", orderId)
                            .with(authenticatedAdmin())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\":\"CANCELLED\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CANCELLED"));

            mockMvc.perform(get("/api/inventory/available")
                            .param("productId", product.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.availableQuantity").value(1));
            org.junit.jupiter.api.Assertions.assertEquals(ProductUnit.Status.AVAILABLE,
                    unitRepository.findById(unit.getId()).orElseThrow().getStatus());
        } finally {
            jdbcTemplate.update("DELETE FROM inventory_movements WHERE order_id IN " +
                    "(SELECT id FROM orders WHERE user_id = ?)", customer.getId());
            jdbcTemplate.update("DELETE FROM order_item_units WHERE order_item_id IN " +
                    "(SELECT id FROM order_items WHERE product_id = ?)", product.getId());
            jdbcTemplate.update("DELETE FROM order_items WHERE product_id = ?", product.getId());
            jdbcTemplate.update("DELETE FROM orders WHERE user_id = ?", customer.getId());
            unitRepository.delete(unit);
            productRepository.delete(product);
            warehouseRepository.delete(warehouse);
            categoryRepository.delete(category);
            userRepository.deleteByEmailIgnoreCase(email);
        }
    }

    @Test
    void customerCanListAndCancelAnIdempotentOrder() throws Exception {
        String suffix = UUID.randomUUID().toString();
        String email = "customer-order-" + suffix + "@example.com";
        StoreUser customer = userRepository.saveAndFlush(new StoreUser(
                "Customer", "Orders", email, passwordEncoder.encode("CheckoutPassword123"),
                null, StoreUser.Role.CUSTOMER));
        Category category = categoryRepository.saveAndFlush(new Category(
                "Customer Order Category " + suffix, "customer-order-category-" + suffix, null));
        Product product = productRepository.saveAndFlush(new Product(
                category, null, "Customer Order Product " + suffix, "customer-order-product-" + suffix,
                null, new BigDecimal("25.00")));
        Warehouse warehouse = warehouseRepository.saveAndFlush(new Warehouse(
                "Customer Order Warehouse " + suffix, "Customer order address"));
        ProductUnit unit = unitRepository.saveAndFlush(new ProductUnit(
                product, warehouse, "CUSTOMER-ORDER-" + suffix, null));
        String orderBody = """
                {
                  "items": [{"productId": %d, "quantity": 1}],
                  "address": {
                    "contactName": "Test Customer", "email": "%s", "phone": "+1 555 123 4567",
                    "street": "Main Street", "building": "12", "apartment": "",
                    "city": "Springfield", "postalCode": "12345", "country": "United States"
                  }
                }
                """.formatted(product.getId(), email);

        try {
            String idempotencyKey = "checkout-" + suffix;
            String firstResponse = mockMvc.perform(post("/api/orders")
                            .with(authenticatedCustomer(email))
                            .header("Idempotency-Key", idempotencyKey)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(orderBody))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.paymentMethod").value("CASH_ON_DELIVERY"))
                    .andReturn().getResponse().getContentAsString();
            Long orderId = Long.parseLong(firstResponse.replaceAll(".*\\\"orderId\\\":([0-9]+).*", "$1"));

            mockMvc.perform(post("/api/orders")
                            .with(authenticatedCustomer(email))
                            .header("Idempotency-Key", idempotencyKey)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(orderBody))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.orderId").value(orderId));

            mockMvc.perform(get("/api/orders/my").with(authenticatedCustomer(email)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(orderId))
                    .andExpect(jsonPath("$[0].status").value("PENDING"));

            mockMvc.perform(post("/api/orders/{id}/cancel", orderId)
                            .with(authenticatedCustomer(email)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CANCELLED"));

            mockMvc.perform(get("/api/inventory/available")
                            .param("productId", product.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.availableQuantity").value(1));
            org.junit.jupiter.api.Assertions.assertEquals(ProductUnit.Status.AVAILABLE,
                    unitRepository.findById(unit.getId()).orElseThrow().getStatus());
        } finally {
            jdbcTemplate.update("DELETE FROM inventory_movements WHERE order_id IN " +
                    "(SELECT id FROM orders WHERE user_id = ?)", customer.getId());
            jdbcTemplate.update("DELETE FROM order_item_units WHERE order_item_id IN " +
                    "(SELECT oi.id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = ?)",
                    customer.getId());
            jdbcTemplate.update("DELETE FROM order_items WHERE order_id IN " +
                    "(SELECT id FROM orders WHERE user_id = ?)", customer.getId());
            jdbcTemplate.update("DELETE FROM orders WHERE user_id = ?", customer.getId());
            jdbcTemplate.update("DELETE FROM inventory_movements WHERE product_unit_id IN " +
                    "(SELECT id FROM product_units WHERE product_id = ?)", product.getId());
            unitRepository.delete(unit);
            productRepository.delete(product);
            warehouseRepository.delete(warehouse);
            categoryRepository.delete(category);
            userRepository.deleteByEmailIgnoreCase(email);
        }
    }
}
