package com.matraders.controller;

import com.matraders.dto.BookOrderRequest;
import com.matraders.entity.*;
import com.matraders.repository.*;
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
    public ResponseEntity<?> bookOrder(@RequestBody BookOrderRequest request) {
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
    public ResponseEntity<String> deliverOrder(@PathVariable Integer order_id) {
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
    public List<Order> getPendingOrders() {
        return orderRepository.findByStatus("pending");
    }
}
