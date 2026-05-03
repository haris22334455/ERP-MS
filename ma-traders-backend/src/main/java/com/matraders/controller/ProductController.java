package com.matraders.controller;

import com.matraders.entity.Product;
import com.matraders.entity.OrderItem;
import com.matraders.repository.ProductRepository;
import com.matraders.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    // GET: Saare products ki list
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    // GET: Search feature
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam("name") String name) {
        return productRepository.searchByName(name);
    }

    // POST: Naya Product add karna
    @PostMapping("/add-product")
    public Product addProduct(@RequestBody Map<String, Object> body) {
        Product product = new Product();
        product.setBrandName((String) body.get("brand"));
        product.setItemName((String) body.get("item_name"));
        product.setPrice(new java.math.BigDecimal(body.get("price").toString()));
        product.setStock(Integer.parseInt(body.get("stock").toString()));
        return productRepository.save(product);
    }

    // PUT: Product update karna
    @PutMapping("/update-product/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Product product = productRepository.findById(id).orElseThrow();
        product.setPrice(new java.math.BigDecimal(body.get("price").toString()));
        product.setStock(Integer.parseInt(body.get("stock").toString()));
        productRepository.save(product);
        return ResponseEntity.ok("Product update ho gaya!");
    }

    // DELETE: Product delete karna
    @DeleteMapping("/delete-product/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Integer id) {
        try {
            // Unlink product from order items before deleting to prevent FK constraint failure
            List<OrderItem> linkedItems = orderItemRepository.findByProductId(id);
            for (OrderItem item : linkedItems) {
                item.setProductId(null);
                orderItemRepository.save(item);
            }
            
            productRepository.deleteById(id);
            return ResponseEntity.ok("Product delete ho gaya!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting product: " + e.getMessage());
        }
    }
}
