package com.erp.repository;

import com.erp.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByProductId(Integer productId);
    List<OrderItem> findByOrderId(Integer orderId);

    @Modifying
    @Query("DELETE FROM OrderItem oi WHERE oi.orderId IN (SELECT o.orderId FROM Order o WHERE o.shopId = :shopId)")
    void deleteByShopId(@Param("shopId") Integer shopId);
}
