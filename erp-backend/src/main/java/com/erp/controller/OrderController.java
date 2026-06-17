package com.erp.controller;

import com.erp.dto.BookOrderRequest;
import com.erp.entity.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private LedgerRepository ledgerRepository;

    @Autowired
    private ShopRepository shopRepository;

    // POST: Multiple items ke saath order book karna
    @PostMapping("/book-order")
    @Transactional
    public ResponseEntity<?> bookOrder(
            @RequestAttribute("role") String role,
            @RequestBody BookOrderRequest request) {
        // ✅ SECURITY FIX: Only admin, staff, or shopkeeper can book orders
        if (!"admin".equalsIgnoreCase(role) && !"staff".equalsIgnoreCase(role) && !"shopkeeper".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access Denied: Unauthorized role"));
        }

        // A. Orders table mein main entry
        Order order = new Order();
        order.setShopId(request.getShop_id());
        order.setUserId(request.getUser_id());
        order.setTotalAmount(request.getTotal_amount());
        order.setStatus("pending");
        Order savedOrder = orderRepository.save(order);

        // B. Order Items table mein har item ki entry
        for (BookOrderRequest.OrderItemRequest item : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(savedOrder.getOrderId());
            orderItem.setProductId(item.getProduct_id());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPriceAtSale(item.getPrice());
            orderItemRepository.save(orderItem);

            // C. Automatically update stock
            productRepository.reduceStock(item.getProduct_id(), item.getQuantity());
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Order booked with items!");
        response.put("order", savedOrder);
        return ResponseEntity.ok(response);
    }

    // PUT: Order Deliver karna aur Ledger Update karna
    @PutMapping("/deliver-order/{order_id}")
    @Transactional
    public ResponseEntity<?> deliverOrder(
            @RequestAttribute("role") String role,
            @PathVariable Integer order_id) {
        // ✅ SECURITY FIX: Only admin or staff can mark orders as delivered
        if (!"admin".equalsIgnoreCase(role) && !"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin or Staff can deliver orders");
        }

        // 1. Order ka data nikalna
        Order order = orderRepository.findById(order_id).orElseThrow();
        Integer shopId = order.getShopId();
        BigDecimal totalAmount = order.getTotalAmount();

        // 2. Status 'delivered' karna
        order.setStatus("delivered");
        orderRepository.save(order);

        // 3. Ledger mein "Udhaar" add karna
        List<Ledger> lastEntries = ledgerRepository.findLatestByShopId(shopId);
        BigDecimal oldBalance = lastEntries.isEmpty() ? BigDecimal.ZERO : lastEntries.get(0).getBalance();
        BigDecimal newBalance = oldBalance.add(totalAmount);

        Ledger ledger = new Ledger();
        ledger.setShopId(shopId);
        ledger.setDescription("Order Delivered (ID: " + order_id + ")");
        ledger.setDebit(totalAmount);
        ledger.setCredit(BigDecimal.ZERO);
        ledger.setBalance(newBalance);
        ledgerRepository.save(ledger);

        // 4. Shop total_debt update
        Shop shop = shopRepository.findById(shopId).orElseThrow();
        shop.setTotalDebt(newBalance);
        shopRepository.save(shop);

        return ResponseEntity.ok("Order delivered and Ledger updated!");
    }

    // GET: Saare pending orders
    @GetMapping("/pending-orders")
    public ResponseEntity<?> getPendingOrders(@RequestAttribute("role") String role) {
        // ✅ SECURITY FIX: Only admin or staff can view all pending orders
        if (!"admin".equalsIgnoreCase(role) && !"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin or Staff can view pending orders");
        }
        return ResponseEntity.ok(orderRepository.findByStatus("pending"));
    }

    // PUT: Order Cancel karna aur Stock Restore karna
    @PutMapping("/cancel-order/{order_id}")
    @Transactional
    public ResponseEntity<?> cancelOrder(
            @RequestAttribute("role") String role,
            @PathVariable Integer order_id) {
        // ✅ SECURITY FIX: Only admin or staff can cancel orders
        if (!"admin".equalsIgnoreCase(role) && !"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin or Staff can cancel orders");
        }

        Order order = orderRepository.findById(order_id).orElseThrow();
        if (!"pending".equalsIgnoreCase(order.getStatus())) {
            return ResponseEntity.badRequest().body("Only pending orders can be cancelled!");
        }

        // 1. Status 'cancelled' karna
        order.setStatus("cancelled");
        orderRepository.save(order);

        // 2. Product stock restore karna
        List<OrderItem> items = orderItemRepository.findByOrderId(order_id);
        for (OrderItem item : items) {
            if (item.getProductId() != null) {
                productRepository.restoreStock(item.getProductId(), item.getQuantity());
            }
        }

        return ResponseEntity.ok("Order cancelled and stock restored!");
    }
}
