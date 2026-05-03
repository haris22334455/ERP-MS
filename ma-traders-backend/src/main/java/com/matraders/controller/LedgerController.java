package com.matraders.controller;

import com.matraders.entity.Ledger;
import com.matraders.entity.Shop;
import com.matraders.repository.LedgerRepository;
import com.matraders.repository.ShopRepository;
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

    // POST: Ledger entry (Maal dena/Paise lena)
    @PostMapping("/add-transaction")
    public Ledger addTransaction(@RequestBody Map<String, Object> body) {
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

        return saved;
    }

    // GET: Kisi dukan ka mukammal ledger history
    @GetMapping("/shop-ledger/{id}")
    public List<Ledger> getShopLedger(@PathVariable Integer id) {
        return ledgerRepository.findByShopIdOrderByDateAsc(id);
    }
}
