package com.erp.controller;

import com.erp.entity.Ledger;
import com.erp.entity.Shop;
import com.erp.entity.User;
import com.erp.repository.LedgerRepository;
import com.erp.repository.ShopRepository;
import com.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
public class LedgerController {

    @Autowired
    private LedgerRepository ledgerRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private UserRepository userRepository;

    // POST: Ledger entry (Maal dena/Paise lena)
    @PostMapping("/add-transaction")
    public ResponseEntity<?> addTransaction(@RequestAttribute("role") String role, @RequestBody Map<String, Object> body) {
        if (!"admin".equalsIgnoreCase(role) && !"staff".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin or Staff can add ledger transactions");
        }
        Integer shopId = Integer.parseInt(body.get("shop_id").toString());
        String description = (String) body.get("description");
        BigDecimal debit = new BigDecimal(body.get("debit").toString());
        BigDecimal credit = new BigDecimal(body.get("credit").toString());

        // Get last balance
        List<Ledger> lastEntries = ledgerRepository.findLatestByShopId(shopId);
        BigDecimal oldBalance = lastEntries.isEmpty() ? BigDecimal.ZERO : lastEntries.get(0).getBalance();
        BigDecimal newBalance = oldBalance.add(debit).subtract(credit);

        // Create ledger entry
        Ledger ledger = new Ledger();
        ledger.setShopId(shopId);
        ledger.setDescription(description);
        ledger.setDebit(debit);
        ledger.setCredit(credit);
        ledger.setBalance(newBalance);
        Ledger saved = ledgerRepository.save(ledger);

        // Update shop total_debt
        Shop shop = shopRepository.findById(shopId).orElseThrow();
        shop.setTotalDebt(newBalance);
        shopRepository.save(shop);

        return ResponseEntity.ok(saved);
    }

    // GET: Kisi dukan ka mukammal ledger history
    @GetMapping("/shop-ledger/{id}")
    public ResponseEntity<?> getShopLedger(
            @RequestAttribute("role") String role,
            @RequestAttribute("userId") Integer userId,
            @PathVariable Integer id) {
        
        if ("shopkeeper".equalsIgnoreCase(role)) {
            User user = userRepository.findById(userId).orElseThrow();
            if (user.getShopId() == null || !user.getShopId().equals(id.toString())) {
                return ResponseEntity.status(403).body("Access Denied: You can only view your own shop's ledger");
            }
        }
        
        List<Ledger> history = ledgerRepository.findByShopIdOrderByDateAsc(id);
        return ResponseEntity.ok(history);
    }
}
