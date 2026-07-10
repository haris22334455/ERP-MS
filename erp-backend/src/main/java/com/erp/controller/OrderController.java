package com.erp.controller;

import com.erp.dto.BookOrderRequest;
import com.erp.dto.ReturnOrderRequest;
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

    // GET: Get orders list, optionally filtered by status
    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(
            @RequestAttribute("role") String role,
            @RequestParam(required = false) String status) {
        if (!"admin".equalsIgnoreCase(role) && !"staff".equalsIgnoreCase(role) && !"shopkeeper".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied");
        }
        if (status == null || status.isBlank()) {
            return ResponseEntity.ok(orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "orderId")));
        }
        return ResponseEntity.ok(orderRepository.findByStatus(status));
    }

    // GET: Get all items inside an order with product names
    @GetMapping("/order-items/{orderId}")
    public ResponseEntity<?> getOrderItems(
            @RequestAttribute("role") String role,
            @PathVariable Integer orderId) {
        if (role == null || role.isBlank()) {
            return ResponseEntity.status(403).body("Access Denied");
        }
        
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        
        for (OrderItem item : items) {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("itemId", item.getItemId());
            map.put("productId", item.getProductId());
            map.put("quantity", item.getQuantity());
            map.put("priceAtSale", item.getPriceAtSale());
            map.put("returnedQuantity", item.getReturnedQuantity() != null ? item.getReturnedQuantity() : 0);
            
            if (item.getProductId() != null) {
                Product p = productRepository.findById(item.getProductId()).orElse(null);
                if (p != null) {
                    map.put("itemName", p.getItemName());
                    map.put("brandName", p.getBrandName());
                } else {
                    map.put("itemName", "Unknown Product");
                    map.put("brandName", "N/A");
                }
            } else {
                map.put("itemName", "Deleted Product");
                map.put("brandName", "N/A");
            }
            result.add(map);
        }
        
        return ResponseEntity.ok(result);
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

    // POST: Return Items from a delivered order
    @PostMapping("/return-order/{orderId}")
    @Transactional
    public ResponseEntity<?> returnOrder(
            @RequestAttribute("role") String role,
            @PathVariable Integer orderId,
            @RequestBody ReturnOrderRequest request) {
        // Only admin or staff can return orders
        if (!"admin".equalsIgnoreCase(role) && !"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin or Staff can process returns");
        }

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return ResponseEntity.status(404).body("Order not found");
        }

        // Only delivered or partially returned orders can have returns
        if (!"delivered".equalsIgnoreCase(order.getStatus()) && !"partially returned".equalsIgnoreCase(order.getStatus())) {
            return ResponseEntity.badRequest().body("Only delivered or partially returned orders can be returned!");
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        BigDecimal totalRefund = BigDecimal.ZERO;

        for (ReturnOrderRequest.ReturnItemRequest returnItem : request.getItems()) {
            Integer prodId = returnItem.getProductId();
            Integer retQty = returnItem.getQuantity();

            if (retQty == null || retQty <= 0) {
                continue;
            }

            // Find matching OrderItem
            OrderItem matchedItem = null;
            for (OrderItem oi : orderItems) {
                if (oi.getProductId() != null && oi.getProductId().equals(prodId)) {
                    matchedItem = oi;
                    break;
                }
            }

            if (matchedItem == null) {
                return ResponseEntity.badRequest().body("Product ID " + prodId + " is not part of this order!");
            }

            int currentReturned = matchedItem.getReturnedQuantity() != null ? matchedItem.getReturnedQuantity() : 0;
            if (currentReturned + retQty > matchedItem.getQuantity()) {
                return ResponseEntity.badRequest().body("Return quantity " + retQty + " exceeds remaining returnable quantity for product ID " + prodId);
            }

            // 1. Update returned quantity on OrderItem
            matchedItem.setReturnedQuantity(currentReturned + retQty);
            orderItemRepository.save(matchedItem);

            // 2. Restore stock for product
            productRepository.restoreStock(prodId, retQty);

            // 3. Accumulate refund amount
            BigDecimal itemRefund = matchedItem.getPriceAtSale().multiply(new BigDecimal(retQty));
            totalRefund = totalRefund.add(itemRefund);
        }

        if (totalRefund.compareTo(BigDecimal.ZERO) > 0) {
            // 4. Determine new Order status
            boolean allReturned = true;
            for (OrderItem oi : orderItems) {
                int returned = oi.getReturnedQuantity() != null ? oi.getReturnedQuantity() : 0;
                if (returned < oi.getQuantity()) {
                    allReturned = false;
                    break;
                }
            }
            order.setStatus(allReturned ? "returned" : "partially returned");
            orderRepository.save(order);

            // 5. Update Ledger with Credit
            Integer shopId = order.getShopId();
            List<Ledger> lastEntries = ledgerRepository.findLatestByShopId(shopId);
            BigDecimal oldBalance = lastEntries.isEmpty() ? BigDecimal.ZERO : lastEntries.get(0).getBalance();
            BigDecimal newBalance = oldBalance.subtract(totalRefund);

            Ledger ledger = new Ledger();
            ledger.setShopId(shopId);
            ledger.setDescription("Returned Items (Order ID: " + orderId + ")");
            ledger.setDebit(BigDecimal.ZERO);
            ledger.setCredit(totalRefund);
            ledger.setBalance(newBalance);
            ledgerRepository.save(ledger);

            // 6. Update Shop total debt
            Shop shop = shopRepository.findById(shopId).orElseThrow();
            shop.setTotalDebt(newBalance);
            shopRepository.save(shop);
        } else {
            return ResponseEntity.badRequest().body("No valid items were returned!");
        }

        return ResponseEntity.ok(Map.of(
            "message", "Return processed successfully",
            "refundAmount", totalRefund,
            "status", order.getStatus()
        ));
    }
}
