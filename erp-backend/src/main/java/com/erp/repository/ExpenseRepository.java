package com.erp.repository;

import com.erp.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Map;

public interface ExpenseRepository extends JpaRepository<Expense, Integer> {

    @Query(value = "SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE EXTRACT(MONTH FROM date) = :month AND EXTRACT(YEAR FROM date) = :year", nativeQuery = true)
    Map<String, Object> getMonthlyExpenses(@Param("month") int month, @Param("year") int year);
}
