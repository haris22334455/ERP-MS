package com.erp.controller;

import com.erp.entity.Product;
import com.erp.entity.OrderItem;
import com.erp.repository.ProductRepository;
import com.erp.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

    // ✅ PAGINATION: GET /products?page=0&size=20&search=xyz
    // Returns paginated response: { content: [...], totalPages, totalElements, number }
    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(
            @RequestAttribute("role") String role,
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "20")  int size,
            @RequestParam(defaultValue = "")    String search) {

        if (role == null || role.isBlank()) {
            return ResponseEntity.status(403).body("Access Denied");
        }

        // Validate bounds
        if (size < 1 || size > 100) size = 20;
        if (page < 0) page = 0;

        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));

        Page<Product> result = search.isBlank()
                ? productRepository.findAll(pageable)
                : productRepository.searchByNamePaged(search, pageable);

        return ResponseEntity.ok(result);
    }

    // GET /products/all — Full unpaginated list (used by Dashboard quick search + Order Booking)
    @GetMapping("/products/all")
    public ResponseEntity<?> getAllProductsUnpaged(@RequestAttribute("role") String role) {
        if (role == null || role.isBlank()) {
            return ResponseEntity.status(403).body("Access Denied");
        }
        return ResponseEntity.ok(productRepository.findAll(Sort.by(Sort.Direction.ASC, "id")));
    }

    // GET: Search feature (non-paginated — for order booking autocomplete)
    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestAttribute("role") String role,
            @RequestParam("name") String name) {
        if (role == null || role.isBlank()) {
            return ResponseEntity.status(403).body("Access Denied");
        }
        return ResponseEntity.ok(productRepository.searchByName(name));
    }

    // POST: Naya Product add karna
    @PostMapping("/add-product")
    public ResponseEntity<?> addProduct(@RequestAttribute("role") String role, @RequestBody Map<String, Object> body) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can add products");
        }
        Product product = new Product();
        product.setBrandName((String) body.get("brand"));
        product.setItemName((String) body.get("item_name"));
        product.setPrice(new java.math.BigDecimal(body.get("price").toString()));
        product.setStock(Integer.parseInt(body.get("stock").toString()));
        product.setCompanyName((String) body.getOrDefault("company_name", "MA Traders"));
        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(savedProduct);
    }

    // PUT: Product update karna
    @PutMapping("/update-product/{id}")
    public ResponseEntity<?> updateProduct(@RequestAttribute("role") String role, @PathVariable Integer id, @RequestBody Map<String, Object> body) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can update products");
        }
        Product product = productRepository.findById(id).orElseThrow();
        if (body.containsKey("brand")) {
            product.setBrandName((String) body.get("brand"));
        }
        if (body.containsKey("item_name")) {
            product.setItemName((String) body.get("item_name"));
        }
        if (body.containsKey("price")) {
            product.setPrice(new java.math.BigDecimal(body.get("price").toString()));
        }
        if (body.containsKey("stock")) {
            product.setStock(Integer.parseInt(body.get("stock").toString()));
        }
        if (body.containsKey("company_name")) {
            product.setCompanyName((String) body.get("company_name"));
        }
        productRepository.save(product);
        return ResponseEntity.ok("Product update ho gaya!");
    }

    // DELETE: Product delete karna
    @DeleteMapping("/delete-product/{id}")
    public ResponseEntity<String> deleteProduct(@RequestAttribute("role") String role, @PathVariable Integer id) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can delete products");
        }
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
