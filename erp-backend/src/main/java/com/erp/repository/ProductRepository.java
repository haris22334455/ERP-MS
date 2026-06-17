package com.erp.repository;

import com.erp.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    // ✅ PAGINATION: Page-based findAll (used by /products endpoint)
    Page<Product> findAll(Pageable pageable);

    // Search without pagination (used by order booking / dashboard search)
    @Query("SELECT p FROM Product p WHERE LOWER(p.itemName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(p.brandName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Product> searchByName(@Param("name") String name);

    // ✅ PAGINATION: Paginated search (used by /products?search=X&page=Y)
    @Query("SELECT p FROM Product p WHERE LOWER(p.itemName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(p.brandName) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Product> searchByNamePaged(@Param("name") String name, Pageable pageable);

    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock - :quantity WHERE p.id = :id")
    void reduceStock(@Param("id") Integer id, @Param("quantity") Integer quantity);

    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock + :quantity WHERE p.id = :id")
    void restoreStock(@Param("id") Integer id, @Param("quantity") Integer quantity);
}
