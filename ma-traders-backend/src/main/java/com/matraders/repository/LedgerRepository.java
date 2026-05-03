package com.matraders.repository;

import com.matraders.entity.Ledger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Map;

public interface LedgerRepository extends JpaRepository<Ledger, Integer> {

    List<Ledger> findByShopIdOrderByDateAsc(Integer shopId);

    @Query("SELECT l FROM Ledger l WHERE l.shopId = :shopId ORDER BY l.date DESC")
    List<Ledger> findLatestByShopId(@Param("shopId") Integer shopId);

    @Query(value = "SELECT COALESCE(SUM(debit), 0) as total_sales_on_credit, COALESCE(SUM(credit), 0) as total_cash_received, (COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0)) as net_balance FROM ledger WHERE date::date = CURRENT_DATE", nativeQuery = true)
    Map<String, Object> getDailyReport();

    @Query(value = "SELECT COUNT(ledger_id) as total_transactions, COALESCE(SUM(debit), 0) as monthly_sales, COALESCE(SUM(credit), 0) as monthly_recovery, (COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0)) as monthly_balance FROM ledger WHERE EXTRACT(MONTH FROM date) = :month AND EXTRACT(YEAR FROM date) = :year", nativeQuery = true)
    Map<String, Object> getMonthlyReport(@Param("month") int month, @Param("year") int year);

    @Query(value = "SELECT COALESCE(SUM(debit), 0) as total_sales FROM ledger WHERE EXTRACT(MONTH FROM date) = :month AND EXTRACT(YEAR FROM date) = :year", nativeQuery = true)
    Map<String, Object> getMonthlySales(@Param("month") int month, @Param("year") int year);

    @Query(value = "SELECT TO_CHAR(l.date, 'DD-MM-YYYY') as formatted_date, s.shop_name, l.description, l.debit as cash_in, l.credit as cash_out, l.balance FROM ledger l LEFT JOIN shops s ON l.shop_id = s.shop_id WHERE date::date = CURRENT_DATE ORDER BY l.date DESC", nativeQuery = true)
    List<Map<String, Object>> getLedgerReportDaily();

    @Query(value = "SELECT TO_CHAR(l.date, 'DD-MM-YYYY') as formatted_date, s.shop_name, l.description, l.debit as cash_in, l.credit as cash_out, l.balance FROM ledger l LEFT JOIN shops s ON l.shop_id = s.shop_id WHERE l.date >= CURRENT_DATE - INTERVAL '7 days' ORDER BY l.date DESC", nativeQuery = true)
    List<Map<String, Object>> getLedgerReportWeekly();

    @Query(value = "SELECT TO_CHAR(l.date, 'DD-MM-YYYY') as formatted_date, s.shop_name, l.description, l.debit as cash_in, l.credit as cash_out, l.balance FROM ledger l LEFT JOIN shops s ON l.shop_id = s.shop_id WHERE l.date >= CURRENT_DATE - INTERVAL '1 month' ORDER BY l.date DESC", nativeQuery = true)
    List<Map<String, Object>> getLedgerReportMonthly();

    @Query(value = "SELECT TO_CHAR(l.date, 'DD-MM-YYYY') as formatted_date, s.shop_name, l.description, l.debit as cash_in, l.credit as cash_out, l.balance FROM ledger l LEFT JOIN shops s ON l.shop_id = s.shop_id ORDER BY l.date DESC", nativeQuery = true)
    List<Map<String, Object>> getLedgerReportAll();
}
