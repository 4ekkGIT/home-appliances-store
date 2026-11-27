package com.nexora.backend.service;

import com.nexora.backend.dto.CheckoutRequest;
import com.nexora.backend.dto.CheckoutResponse;
import com.nexora.backend.entity.InventoryMovement;
import com.nexora.backend.entity.Product;
import com.nexora.backend.entity.ProductUnit;
import com.nexora.backend.entity.StoreUser;
import com.nexora.backend.repository.InventoryMovementRepository;
import com.nexora.backend.repository.ProductRepository;
import com.nexora.backend.repository.ProductUnitRepository;
import com.nexora.backend.repository.StoreUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class OrderService {
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("10.00");

    private final JdbcTemplate jdbcTemplate;
    private final ProductRepository productRepository;
    private final ProductUnitRepository unitRepository;
    private final InventoryMovementRepository movementRepository;
    private final StoreUserRepository userRepository;

    public OrderService(JdbcTemplate jdbcTemplate, ProductRepository productRepository,
                        ProductUnitRepository unitRepository,
                        InventoryMovementRepository movementRepository, StoreUserRepository userRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.productRepository = productRepository;
        this.unitRepository = unitRepository;
        this.movementRepository = movementRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CheckoutResponse create(CheckoutRequest request, String email) {
        StoreUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        Set<Long> productIds = new HashSet<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CheckoutRequest.Item item : request.items()) {
            if (!productIds.add(item.productId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A product can only appear once in the order");
            }
            Product product = getActiveProduct(item.productId());
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
        }

        BigDecimal total = subtotal.add(DELIVERY_FEE);
        Long orderId = jdbcTemplate.queryForObject(
            "INSERT INTO orders (user_id, status, total_amount, shipping_address) " +
                "VALUES (?, 'PENDING', ?, jsonb_build_object(" +
                "'contactName', ?, 'email', ?, 'phone', ?, 'street', ?, 'building', ?, " +
                "'apartment', ?, 'city', ?, 'postalCode', ?, 'country', ?, 'subtotal', ?, " +
                "'deliveryFee', ?)) RETURNING id",
            Long.class, user.getId(), total,
            request.address().contactName().trim(), request.address().email().trim(),
            request.address().phone().trim(), request.address().street().trim(),
            request.address().building().trim(), request.address().apartment() == null
                ? "" : request.address().apartment().trim(),
            request.address().city().trim(), request.address().postalCode().trim(),
            request.address().country().trim(), subtotal, DELIVERY_FEE);

        for (CheckoutRequest.Item item : request.items()) {
            Product product = getActiveProduct(item.productId());
            List<ProductUnit> units = unitRepository.findAvailableForUpdate(product.getId(), item.quantity());
            if (units.size() < item.quantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Insufficient stock for " + product.getName());
            }

            Long orderItemId = jdbcTemplate.queryForObject(
                    "INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) " +
                            "VALUES (?, ?, ?, ?, ?) RETURNING id",
                    Long.class, orderId, product.getId(), product.getName(), item.quantity(), product.getPrice());

            for (ProductUnit unit : units) {
                unit.changeStatus(ProductUnit.Status.RESERVED);
                unitRepository.save(unit);
                jdbcTemplate.update(
                        "INSERT INTO order_item_units (order_item_id, product_unit_id, product_id) VALUES (?, ?, ?)",
                        orderItemId, unit.getId(), product.getId());
                movementRepository.save(new InventoryMovement(
                        unit, null, unit.getWarehouse(), orderId, user,
                        InventoryMovement.MovementType.RESERVATION,
                        ProductUnit.Status.AVAILABLE, ProductUnit.Status.RESERVED,
                        "Reserved for online order"));
            }
        }

        return new CheckoutResponse(orderId, "PENDING", subtotal, DELIVERY_FEE, total);
    }

    private Product getActiveProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A product in this order is no longer available");
        }
        return product;
    }

}