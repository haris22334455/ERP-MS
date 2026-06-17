package com.erp.dto;

import java.math.BigDecimal;
import java.util.List;

public class BookOrderRequest {
    private Integer shop_id;
    private Integer user_id;
    private BigDecimal total_amount;
    private List<OrderItemRequest> items;

    // Getters and Setters
    public Integer getShop_id() { return shop_id; }
    public void setShop_id(Integer shop_id) { this.shop_id = shop_id; }

    public Integer getUser_id() { return user_id; }
    public void setUser_id(Integer user_id) { this.user_id = user_id; }

    public BigDecimal getTotal_amount() { return total_amount; }
    public void setTotal_amount(BigDecimal total_amount) { this.total_amount = total_amount; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }

    public static class OrderItemRequest {
        private Integer product_id;
        private Integer quantity;
        private BigDecimal price;

        public Integer getProduct_id() { return product_id; }
        public void setProduct_id(Integer product_id) { this.product_id = product_id; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }
}
