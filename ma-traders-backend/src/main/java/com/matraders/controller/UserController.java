package com.matraders.controller;

import com.matraders.entity.User;
import com.matraders.repository.OrderRepository;
import com.matraders.repository.UserRepository;
import com.matraders.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // GET: Saare users ki list
    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        List<User> users = userRepository.findAll(org.springframework.data.domain.Sort.by("userId"));
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getUserId());
            map.put("username", u.getUsername());
            map.put("role", u.getRole());
            map.put("shop_id", u.getShopId());
            result.add(map);
        }
        return result;
    }

    // POST: User Registration
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String username = (String) body.get("username");
        String password = (String) body.get("password");
        String role = (String) body.get("role");
        Object shopIdObj = body.get("shop_id");
        String shopId = shopIdObj != null ? shopIdObj.toString() : null;

        // Check if user already exists
        Optional<User> existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            return ResponseEntity.status(401).body(Map.of("message", "Username already taken!"));
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setRole(role);
        user.setShopId(shopId);

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    // POST: Login with Token
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid Username");
        }

        User user = userOpt.get();
        if (!password.equals(user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid Password");
        }

        // Generate token
        String token = jwtUtil.generateToken(user.getUserId(), user.getRole());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Login Successful!");
        response.put("token", token);

        Map<String, Object> userData = new LinkedHashMap<>();
        userData.put("id", user.getUserId());
        userData.put("username", user.getUsername());
        userData.put("role", user.getRole());
        userData.put("shop_id", user.getShopId());
        response.put("user", userData);

        return ResponseEntity.ok(response);
    }

    // DELETE: User delete karo by ID
    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
        try {
            // Pehle orders mein se user_id NULL kar do
            orderRepository.nullifyUserIdByUserId(id);
            // Ab user delete kar do
            userRepository.deleteById(id);
            userRepository.flush();
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(409).body(Map.of("message", "Cannot delete user: " + e.getMessage()));
        }
    }
}
