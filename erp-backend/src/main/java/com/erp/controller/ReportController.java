package com.erp.controller;

import com.erp.repository.ExpenseRepository;
import com.erp.repository.LedgerRepository;
import com.erp.repository.ShopRepository;
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
    public ResponseEntity<?> getStaffSales(@RequestAttribute("role") String role) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can access staff sales report");
        }
        String sql = """
            SELECT u.username AS staff_member, s.shop_name, p.item_name AS product, 
                   oi.quantity, o.total_amount, o.status
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id
            JOIN shops s ON o.shop_id = s.shop_id
            JOIN "ERP-MS" p ON oi.product_id = p.id
            """;
        return ResponseEntity.ok(executeNativeQuery(sql));
    }

    // GET: Daily Balance Sheet
    @GetMapping("/admin/daily-report")
    public ResponseEntity<?> getDailyReport(@RequestAttribute("role") String role) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can access daily report");
        }
        Map<String, Object> report = ledgerRepository.getDailyReport();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("date", LocalDate.now().toString());
        response.put("summary", report);
        return ResponseEntity.ok(response);
    }

    // GET: Monthly Balance Sheet (JWT Protected)
    @GetMapping("/admin/monthly-report")
    public ResponseEntity<?> getMonthlyReport(@RequestAttribute("role") String role, @RequestParam int month, @RequestParam int year) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can access monthly report");
        }
        Map<String, Object> report = ledgerRepository.getMonthlyReport(month, year);
        return ResponseEntity.ok(report);
    }

    // GET: Detailed Sales History
    @GetMapping("/admin/detailed-sales")
    public ResponseEntity<?> getDetailedSales(@RequestAttribute("role") String role) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can access detailed sales report");
        }
        String sql = """
            SELECT u.username AS staff_name, s.shop_name, p.item_name AS product, 
                   oi.quantity, o.total_amount AS bill_amount, o.order_date, o.status
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id
            JOIN shops s ON o.shop_id = s.shop_id
            JOIN "ERP-MS" p ON oi.product_id = p.id
            ORDER BY o.order_date DESC
            """;
        return ResponseEntity.ok(executeNativeQuery(sql));
    }

    // GET: Detailed Ledger Report for PDF
    @GetMapping("/admin/ledger-report")
    public ResponseEntity<?> getLedgerReport(@RequestAttribute("role") String role, @RequestParam(defaultValue = "") String period) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can access ledger report");
        }
        List<Map<String, Object>> data = switch (period) {
            case "daily" -> ledgerRepository.getLedgerReportDaily();
            case "weekly" -> ledgerRepository.getLedgerReportWeekly();
            case "monthly" -> ledgerRepository.getLedgerReportMonthly();
            default -> ledgerRepository.getLedgerReportAll();
        };
        return ResponseEntity.ok(data);
    }

    // GET: Shop Recovery Status
    @GetMapping("/admin/recovery-status")
    public ResponseEntity<?> getRecoveryStatus(@RequestAttribute("role") String role) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can access recovery status");
        }
        var shops = shopRepository.findShopsWithPendingDues();
        List<Map<String, Object>> result = new ArrayList<>();
        for (var shop : shops) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("shop_name", shop.getShopName());
            map.put("shop_address", shop.getShopAddress());
            map.put("amount_pending", shop.getTotalDebt());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    // GET: Profit & Loss Summary
    @GetMapping("/admin/net-profit")
    public ResponseEntity<?> getNetProfit(@RequestAttribute("role") String role, @RequestParam int month, @RequestParam int year) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can access net profit summary");
        }
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
        return ResponseEntity.ok(response);
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
