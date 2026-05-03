package com.matraders.repository;

import com.matraders.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Map;

public interface ShopRepository extends JpaRepository<Shop, Integer> {

    @Query("SELECT COALESCE(SUM(s.totalDebt), 0) as totalMarketReceivable, COUNT(s) as totalShops FROM Shop s")
    Map<String, Object> getMarketSummary();

    @Query("SELECT s FROM Shop s WHERE s.totalDebt > 0 ORDER BY s.totalDebt DESC")
    List<Shop> findShopsWithPendingDues();
}
