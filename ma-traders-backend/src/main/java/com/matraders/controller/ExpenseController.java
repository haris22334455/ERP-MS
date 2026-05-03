package com.matraders.controller;

import com.matraders.entity.Expense;
import com.matraders.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    // POST: Naya kharcha (Expense) add karna
    @PostMapping("/add-expense")
    public Map<String, Object> addExpense(@RequestBody Map<String, Object> body) {
        Expense expense = new Expense();
        expense.setDescription((String) body.get("description"));
        expense.setAmount(new BigDecimal(body.get("amount").toString()));
        expense.setCategory((String) body.get("category"));

        Expense saved = expenseRepository.save(expense);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Expense added!");
        response.put("data", saved);
        return response;
    }
}
