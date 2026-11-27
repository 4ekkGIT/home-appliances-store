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

        if (nextStatus == OrderStatusRequest.Status.CANCELLED || nextStatus == OrderStatusRequest.Status.SHIPPED) {
            List<ProductUnit> units = jdbcTemplate.query(
                    "SELECT pu.id FROM product_units pu " +
                            "JOIN order_item_units oiu ON oiu.product_unit_id = pu.id " +
                            "JOIN order_items oi ON oi.id = oiu.order_item_id " +
                            "WHERE oi.order_id = ? AND oiu.released_at IS NULL FOR UPDATE OF pu",
                    (rs, rowNum) -> unitRepository.findById(rs.getLong("id")).orElseThrow(), orderId);
            StoreUser actor = getActor(authentication);
            for (ProductUnit unit : units) {
                ProductUnit.Status previous = unit.getStatus();
                var previousWarehouse = unit.getWarehouse();
                unit.changeStatus(nextStatus == OrderStatusRequest.Status.CANCELLED
                        ? ProductUnit.Status.AVAILABLE : ProductUnit.Status.SOLD);
                unitRepository.save(unit);
                movementRepository.save(new InventoryMovement(unit,
                        nextStatus == OrderStatusRequest.Status.CANCELLED ? null : previousWarehouse,
                        nextStatus == OrderStatusRequest.Status.CANCELLED ? previousWarehouse : null,
                        orderId, actor,
                        nextStatus == OrderStatusRequest.Status.CANCELLED
                                ? InventoryMovement.MovementType.RELEASE : InventoryMovement.MovementType.SALE,
                        previous, unit.getStatus(), "Order " + nextStatus.name().toLowerCase()));
            }
            jdbcTemplate.update("UPDATE order_item_units SET released_at = CURRENT_TIMESTAMP " +
                    "WHERE order_item_id IN (SELECT id FROM order_items WHERE order_id = ?) " +
                    "AND released_at IS NULL", orderId);
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