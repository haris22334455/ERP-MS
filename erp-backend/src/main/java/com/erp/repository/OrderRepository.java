package com.erp.repository;

import com.erp.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByStatus(String status);

    @Modifying
    @Query("UPDATE Order o SET o.userId = NULL WHERE o.userId = :userId")
    void nullifyUserIdByUserId(@Param("userId") Integer userId);
    @Modifying
    @Query("DELETE FROM Order o WHERE o.shopId = :shopId")
    void deleteByShopId(@Param("shopId") Integer shopId);
}
