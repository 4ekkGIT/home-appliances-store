package com.nexora.backend.service;

import com.nexora.backend.dto.CheckoutRequest;
import com.nexora.backend.dto.CheckoutResponse;
import com.nexora.backend.dto.AdminOrderResponse;
import com.nexora.backend.dto.OrderStatusRequest;
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
import org.springframework.security.core.Authentication;
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
        return create(request, email, null);
    }

    @Transactional
    public CheckoutResponse create(CheckoutRequest request, String email, String rawIdempotencyKey) {
        StoreUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        String idempotencyKey = normalizeIdempotencyKey(rawIdempotencyKey);
        // Serializing requests per user makes the idempotency lookup safe when
        // a browser retries the same checkout at exactly the same time.
        jdbcTemplate.queryForObject("SELECT id FROM users WHERE id = ? FOR UPDATE", Long.class, user.getId());
        if (idempotencyKey != null) {
            CheckoutResponse previousOrder = findCheckoutByIdempotencyKey(user.getId(), idempotencyKey);
            if (previousOrder != null) {
                return previousOrder;
            }
        }
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
            "INSERT INTO orders (user_id, status, total_amount, shipping_address, idempotency_key) " +
                "VALUES (?, 'PENDING', ?, jsonb_build_object(" +
                "'contactName', ?, 'email', ?, 'phone', ?, 'street', ?, 'building', ?, " +
                "'apartment', ?, 'city', ?, 'postalCode', ?, 'country', ?, 'subtotal', ?, " +
                "'deliveryFee', ?, 'paymentMethod', 'CASH_ON_DELIVERY'), ?) RETURNING id",
            Long.class, user.getId(), total,
            request.address().contactName().trim(), request.address().email().trim(),
            request.address().phone().trim(), request.address().street().trim(),
            request.address().building().trim(), request.address().apartment() == null
                ? "" : request.address().apartment().trim(),
            request.address().city().trim(), request.address().postalCode().trim(),
            request.address().country().trim(), subtotal, DELIVERY_FEE, idempotencyKey);

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

        return new CheckoutResponse(orderId, "PENDING", subtotal, DELIVERY_FEE, total,
                "CASH_ON_DELIVERY");
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> findForCustomer(String email) {
        return jdbcTemplate.query("SELECT o.id FROM orders o JOIN users u ON u.id = o.user_id " +
                        "WHERE LOWER(u.email) = LOWER(?) ORDER BY o.created_at DESC",
                (rs, rowNum) -> findOrder(rs.getLong("id")), email);
    }

    @Transactional
    public AdminOrderResponse cancelByCustomer(Long orderId, String email) {
        List<OrderOwnership> orders = jdbcTemplate.query(
                "SELECT o.user_id, o.status FROM orders o JOIN users u ON u.id = o.user_id " +
                        "WHERE o.id = ? AND LOWER(u.email) = LOWER(?) FOR UPDATE",
                (rs, rowNum) -> new OrderOwnership(rs.getLong("user_id"), rs.getString("status")),
                orderId, email);
        if (orders.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        if (!("PENDING".equals(orders.get(0).status()) || "CONFIRMED".equals(orders.get(0).status()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only pending or confirmed orders can be cancelled");
        }
        releaseReservedUnits(orderId, getActorByEmail(email), "Order cancelled by customer");
        jdbcTemplate.update("UPDATE orders SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                orderId);
        return findOrder(orderId);
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> findAllForAdmin() {
        return jdbcTemplate.query("SELECT o.id, u.email, o.status, o.total_amount, " +
                "o.shipping_address ->> 'contactName' AS contact_name, " +
                "o.shipping_address ->> 'email' AS shipping_email, " +
                "o.shipping_address ->> 'phone' AS phone, " +
                "o.shipping_address ->> 'street' AS street, " +
                "o.shipping_address ->> 'building' AS building, " +
                "o.shipping_address ->> 'apartment' AS apartment, " +
                "o.shipping_address ->> 'city' AS city, " +
                "o.shipping_address ->> 'postalCode' AS postal_code, " +
                "o.shipping_address ->> 'country' AS country, " +
                "(o.shipping_address ->> 'subtotal')::numeric AS subtotal, " +
                "(o.shipping_address ->> 'deliveryFee')::numeric AS delivery_fee, o.created_at " +
                        "FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC",
                (rs, rowNum) -> {
                    Long orderId = rs.getLong("id");
                    List<AdminOrderResponse.Item> items = findOrderItems(orderId);
                    return new AdminOrderResponse(orderId, rs.getString("email"),
                            rs.getString("status"), rs.getBigDecimal("total_amount"),
                            readAddress(rs),
                            rs.getObject("created_at", java.time.OffsetDateTime.class), items);
                });
    }

    @Transactional
    public AdminOrderResponse updateStatus(Long orderId, OrderStatusRequest.Status nextStatus,
                                          Authentication authentication) {
        List<String> statuses = jdbcTemplate.query(
                "SELECT status FROM orders WHERE id = ? FOR UPDATE",
                (rs, rowNum) -> rs.getString("status"), orderId);
        if (statuses.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        String currentStatus = statuses.get(0);
        if (!isAllowedTransition(currentStatus, nextStatus.name())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order status cannot change from " + currentStatus + " to " + nextStatus);
        }

        if (nextStatus == OrderStatusRequest.Status.CANCELLED) {
            releaseReservedUnits(orderId, getActor(authentication), "Order cancelled by administrator");
        } else if (nextStatus == OrderStatusRequest.Status.SHIPPED) {
            sellReservedUnits(orderId, getActor(authentication));
        }
        jdbcTemplate.update("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                nextStatus.name(), orderId);
        return findOrder(orderId);
    }

    private List<AdminOrderResponse.Item> findOrderItems(Long orderId) {
        return jdbcTemplate.query("SELECT product_id, product_name, quantity, unit_price, line_total " +
                        "FROM order_items WHERE order_id = ? ORDER BY id",
                (rs, rowNum) -> new AdminOrderResponse.Item(
                    rs.getObject("product_id", Long.class), rs.getString("product_name"),
                        rs.getInt("quantity"), rs.getBigDecimal("unit_price"),
                        rs.getBigDecimal("line_total")), orderId);
    }

    private AdminOrderResponse findOrder(Long orderId) {
        return jdbcTemplate.queryForObject("SELECT o.id, u.email, o.status, o.total_amount, " +
                "o.shipping_address ->> 'contactName' AS contact_name, " +
                "o.shipping_address ->> 'email' AS shipping_email, " +
                "o.shipping_address ->> 'phone' AS phone, " +
                "o.shipping_address ->> 'street' AS street, " +
                "o.shipping_address ->> 'building' AS building, " +
                "o.shipping_address ->> 'apartment' AS apartment, " +
                "o.shipping_address ->> 'city' AS city, " +
                "o.shipping_address ->> 'postalCode' AS postal_code, " +
                "o.shipping_address ->> 'country' AS country, " +
                "(o.shipping_address ->> 'subtotal')::numeric AS subtotal, " +
                "(o.shipping_address ->> 'deliveryFee')::numeric AS delivery_fee, o.created_at " +
                        "FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?",
                (rs, rowNum) -> new AdminOrderResponse(rs.getLong("id"), rs.getString("email"),
                        rs.getString("status"), rs.getBigDecimal("total_amount"),
                        readAddress(rs),
                        rs.getObject("created_at", java.time.OffsetDateTime.class),
                        findOrderItems(rs.getLong("id"))), orderId);
    }

    private AdminOrderResponse.Address readAddress(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new AdminOrderResponse.Address(
                rs.getString("contact_name"), rs.getString("shipping_email"),
                rs.getString("phone"), rs.getString("street"), rs.getString("building"),
                rs.getString("apartment"), rs.getString("city"), rs.getString("postal_code"),
                rs.getString("country"), rs.getBigDecimal("subtotal"),
                rs.getBigDecimal("delivery_fee"));
    }

    private StoreUser getActor(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName()).orElse(null);
    }

    private StoreUser getActorByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email).orElse(null);
    }

    private void releaseReservedUnits(Long orderId, StoreUser actor, String comment) {
        List<ProductUnit> units = jdbcTemplate.query(
                "SELECT pu.id FROM product_units pu " +
                        "JOIN order_item_units oiu ON oiu.product_unit_id = pu.id " +
                        "JOIN order_items oi ON oi.id = oiu.order_item_id " +
                        "WHERE oi.order_id = ? AND oiu.released_at IS NULL FOR UPDATE OF pu",
                (rs, rowNum) -> unitRepository.findById(rs.getLong("id")).orElseThrow(), orderId);
        for (ProductUnit unit : units) {
            ProductUnit.Status previous = unit.getStatus();
            var previousWarehouse = unit.getWarehouse();
            unit.changeStatus(ProductUnit.Status.AVAILABLE);
            unitRepository.save(unit);
            movementRepository.save(new InventoryMovement(unit, null, previousWarehouse, orderId, actor,
                    InventoryMovement.MovementType.RELEASE, previous, unit.getStatus(), comment));
        }
        jdbcTemplate.update("UPDATE order_item_units SET released_at = CURRENT_TIMESTAMP " +
                "WHERE order_item_id IN (SELECT id FROM order_items WHERE order_id = ?) " +
                "AND released_at IS NULL", orderId);
    }

    private void sellReservedUnits(Long orderId, StoreUser actor) {
        List<ProductUnit> units = jdbcTemplate.query(
                "SELECT pu.id FROM product_units pu " +
                        "JOIN order_item_units oiu ON oiu.product_unit_id = pu.id " +
                        "JOIN order_items oi ON oi.id = oiu.order_item_id " +
                        "WHERE oi.order_id = ? AND oiu.released_at IS NULL FOR UPDATE OF pu",
                (rs, rowNum) -> unitRepository.findById(rs.getLong("id")).orElseThrow(), orderId);
        for (ProductUnit unit : units) {
            ProductUnit.Status previous = unit.getStatus();
            var previousWarehouse = unit.getWarehouse();
            unit.changeStatus(ProductUnit.Status.SOLD);
            unitRepository.save(unit);
            movementRepository.save(new InventoryMovement(unit, previousWarehouse, null, orderId, actor,
                    InventoryMovement.MovementType.SALE, previous, unit.getStatus(), "Order shipped"));
        }
        jdbcTemplate.update("UPDATE order_item_units SET released_at = CURRENT_TIMESTAMP " +
                "WHERE order_item_id IN (SELECT id FROM order_items WHERE order_id = ?) " +
                "AND released_at IS NULL", orderId);
    }

    private CheckoutResponse findCheckoutByIdempotencyKey(Long userId, String idempotencyKey) {
        List<CheckoutResponse> results = jdbcTemplate.query(
                "SELECT id, status, total_amount, shipping_address ->> 'subtotal' AS subtotal, " +
                        "shipping_address ->> 'deliveryFee' AS delivery_fee " +
                        "FROM orders WHERE user_id = ? AND idempotency_key = ?",
                (rs, rowNum) -> new CheckoutResponse(rs.getLong("id"), rs.getString("status"),
                        rs.getBigDecimal("subtotal"), rs.getBigDecimal("delivery_fee"),
                        rs.getBigDecimal("total_amount"), "CASH_ON_DELIVERY"), userId, idempotencyKey);
        return results.isEmpty() ? null : results.get(0);
    }

    private String normalizeIdempotencyKey(String rawKey) {
        if (rawKey == null || rawKey.isBlank()) {
            return null;
        }
        String key = rawKey.trim();
        if (key.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Idempotency-Key must be at most 100 characters");
        }
        return key;
    }

    private record OrderOwnership(Long userId, String status) {}

    private boolean isAllowedTransition(String current, String next) {
        return switch (current) {
            case "PENDING" -> Set.of("CONFIRMED", "CANCELLED").contains(next);
            case "CONFIRMED" -> Set.of("PROCESSING", "CANCELLED").contains(next);
            case "PROCESSING" -> Set.of("SHIPPED", "CANCELLED").contains(next);
            case "SHIPPED" -> "DELIVERED".equals(next);
            default -> false;
        };
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
