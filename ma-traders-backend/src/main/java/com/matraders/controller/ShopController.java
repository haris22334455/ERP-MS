package com.matraders.controller;

import com.matraders.entity.Shop;
import com.matraders.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ShopController {

    @Autowired
    private ShopRepository shopRepository;

    // POST: Nayi dukan register karna
    @PostMapping("/add-shop")
    public Shop addShop(@RequestBody Map<String, String> body) {
        Shop shop = new Shop();
        shop.setShopName(body.get("shop_name"));
        shop.setShopAddress(body.get("shop_address"));
        shop.setTotalDebt(java.math.BigDecimal.ZERO);
        return shopRepository.save(shop);
    }

    // GET: Saare shops ki list
    @GetMapping("/shops")
    public List<Shop> getAllShops() {
        return shopRepository.findAll(Sort.by(Sort.Direction.ASC, "shopId"));
    }

    // DELETE: Shop delete karna
    @DeleteMapping("/delete-shop/{id}")
    public ResponseEntity<String> deleteShop(@PathVariable Integer id) {
        shopRepository.deleteById(id);
        return ResponseEntity.ok("Shop deleted successfully!");
    }

    // GET: Market Summary
    @GetMapping("/market-summary")
    public Map<String, Object> getMarketSummary() {
        return shopRepository.getMarketSummary();
    }
}
