package com.matraders.controller;

import com.matraders.repository.ExpenseRepository;
import com.matraders.repository.LedgerRepository;
import com.matraders.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
public class ReportController {

    @Autowired
    private LedgerRepository ledgerRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // GET: Admin Report - Staff Sales
    @GetMapping("/admin/staff-sales")
    public List<Map<String, Object>> getStaffSales() {
        String sql = """
            SELECT u.username AS staff_member, s.shop_name, p.item_name AS product, 
                   oi.quantity, o.total_amount, o.status
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id
            JOIN shops s ON o.shop_id = s.shop_id
            JOIN "MA Traders" p ON oi.product_id = p.id
            """;
        return executeNativeQuery(sql);
    }

    // GET: Daily Balance Sheet
    @GetMapping("/admin/daily-report")
    public Map<String, Object> getDailyReport() {
        Map<String, Object> report = ledgerRepository.getDailyReport();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("date", LocalDate.now().toString());
        response.put("summary", report);
        return response;
    }

    // GET: Monthly Balance Sheet (JWT Protected)
    @GetMapping("/admin/monthly-report")
    public ResponseEntity<?> getMonthlyReport(@RequestParam int month, @RequestParam int year) {
        Map<String, Object> report = ledgerRepository.getMonthlyReport(month, year);
        return ResponseEntity.ok(report);
    }

    // GET: Detailed Sales History
    @GetMapping("/admin/detailed-sales")
    public List<Map<String, Object>> getDetailedSales() {
        String sql = """
            SELECT u.username AS staff_name, s.shop_name, p.item_name AS product, 
                   oi.quantity, o.total_amount AS bill_amount, o.order_date, o.status
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id
            JOIN shops s ON o.shop_id = s.shop_id
            JOIN "MA Traders" p ON oi.product_id = p.id
            ORDER BY o.order_date DESC
            """;
        return executeNativeQuery(sql);
    }

    // GET: Detailed Ledger Report for PDF
    @GetMapping("/admin/ledger-report")
    public List<Map<String, Object>> getLedgerReport(@RequestParam(defaultValue = "") String period) {
        return switch (period) {
            case "daily" -> ledgerRepository.getLedgerReportDaily();
            case "weekly" -> ledgerRepository.getLedgerReportWeekly();
            case "monthly" -> ledgerRepository.getLedgerReportMonthly();
            default -> ledgerRepository.getLedgerReportAll();
        };
    }

    // GET: Shop Recovery Status
    @GetMapping("/admin/recovery-status")
    public List<Map<String, Object>> getRecoveryStatus() {
        var shops = shopRepository.findShopsWithPendingDues();
        List<Map<String, Object>> result = new ArrayList<>();
        for (var shop : shops) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("shop_name", shop.getShopName());
            map.put("shop_address", shop.getShopAddress());
            map.put("amount_pending", shop.getTotalDebt());
            result.add(map);
        }
        return result;
    }

    // GET: Profit & Loss Summary
    @GetMapping("/admin/net-profit")
    public Map<String, Object> getNetProfit(@RequestParam int month, @RequestParam int year) {
        Map<String, Object> salesData = ledgerRepository.getMonthlySales(month, year);
        Map<String, Object> expData = expenseRepository.getMonthlyExpenses(month, year);

        BigDecimal totalSales = new BigDecimal(salesData.get("total_sales").toString());
        BigDecimal totalExpenses = new BigDecimal(expData.get("total_expenses").toString());
        BigDecimal profit = totalSales.subtract(totalExpenses);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("month", month);
        response.put("year", year);
        response.put("gross_sales", totalSales);
        response.put("total_expenses", totalExpenses);
        response.put("net_profit", profit);
        response.put("status", profit.compareTo(BigDecimal.ZERO) >= 0 ? "Profit" : "Loss");
        return response;
    }

    // Helper method to execute native SQL and return List<Map>
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> executeNativeQuery(String sql) {
        var nativeQuery = entityManager.createNativeQuery(sql);
        nativeQuery.unwrap(org.hibernate.query.NativeQuery.class)
                .setTupleTransformer((tuple, aliases) -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    for (int i = 0; i < aliases.length; i++) {
                        map.put(aliases[i], tuple[i]);
                    }
                    return map;
                });
        return nativeQuery.getResultList();
    }
}
