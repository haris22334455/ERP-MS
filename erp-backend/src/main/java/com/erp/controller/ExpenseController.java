package com.erp.controller;

import com.erp.entity.Expense;
import com.erp.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    // POST: Naya kharcha (Expense) add karna
    @PostMapping("/add-expense")
    public ResponseEntity<?> addExpense(@RequestAttribute("role") String role, @RequestBody Map<String, Object> body) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can add expenses");
        }
        Expense expense = new Expense();
        expense.setDescription((String) body.get("description"));
        expense.setAmount(new BigDecimal(body.get("amount").toString()));
        expense.setCategory((String) body.get("category"));

        Expense saved = expenseRepository.save(expense);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Expense added!");
        response.put("data", saved);
        return ResponseEntity.ok(response);
    }

    // GET: Tamam kharche (Expenses) list get karna
    @GetMapping("/expenses")
    public ResponseEntity<?> getAllExpenses(@RequestAttribute("role") String role) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can view expenses");
        }
        List<Expense> expenses = expenseRepository.findAll(Sort.by(Sort.Direction.DESC, "expenseId"));
        return ResponseEntity.ok(expenses);
    }
}
