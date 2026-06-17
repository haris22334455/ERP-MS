package com.erp.controller;

import com.erp.entity.Shop;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ShopController {

    @Autowired
    private ShopRepository shopRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private LedgerRepository ledgerRepository;

    @Autowired
    private UserRepository userRepository;

    // POST: Nayi dukan register karna — Admin only
    @PostMapping("/add-shop")
    public ResponseEntity<?> addShop(
            @RequestAttribute("role") String role,
            @RequestBody Map<String, String> body) {
        // ✅ SECURITY FIX: Only admin can add shops
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can add shops");
        }
        Shop shop = new Shop();
        shop.setShopName(body.get("shop_name"));
        shop.setShopAddress(body.get("shop_address"));
        shop.setTotalDebt(java.math.BigDecimal.ZERO);
        return ResponseEntity.ok(shopRepository.save(shop));
    }

    // GET: Saare shops ki list — Admin and Staff
    @GetMapping("/shops")
    public ResponseEntity<?> getAllShops(@RequestAttribute("role") String role) {
        // ✅ SECURITY FIX: Only admin or staff can list all shops
        if (!"admin".equalsIgnoreCase(role) && !"staff".equalsIgnoreCase(role) && !"shopkeeper".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Unauthorized");
        }
        return ResponseEntity.ok(shopRepository.findAll(Sort.by(Sort.Direction.ASC, "shopId")));
    }

    // DELETE: Shop delete karna — Admin only
    @Transactional
    @DeleteMapping("/delete-shop/{id}")
    public ResponseEntity<String> deleteShop(
            @RequestAttribute("role") String role,
            @PathVariable Integer id) {
        // ✅ SECURITY FIX: Only admin can delete shops
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can delete shops");
        }
        try {
            // 1. Order Items delete karo (JO orders is shop se linked hain)
            orderItemRepository.deleteByShopId(id);
            
            // 2. Orders delete karo
            orderRepository.deleteByShopId(id);
            
            // 3. Ledger entries delete karo
            ledgerRepository.deleteByShopId(id);
            
            // 4. Users mein se shop_id NULL karo
            userRepository.nullifyShopId(id.toString());
            
            // 5. Ab shop delete kar do
            shopRepository.deleteById(id);
            
            return ResponseEntity.ok("Shop deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting shop: " + e.getMessage());
        }
    }

    // GET: Market Summary — Admin only
    @GetMapping("/market-summary")
    public ResponseEntity<?> getMarketSummary(@RequestAttribute("role") String role) {
        // ✅ SECURITY FIX: Only admin can see market summary
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can view market summary");
        }
        return ResponseEntity.ok(shopRepository.getMarketSummary());
    }
}
