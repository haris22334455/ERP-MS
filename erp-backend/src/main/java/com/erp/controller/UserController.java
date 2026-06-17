package com.erp.controller;

import com.erp.entity.User;
import com.erp.repository.OrderRepository;
import com.erp.repository.UserRepository;
import com.erp.security.JwtUtil;
import com.erp.security.LoginRateLimiter;
import com.erp.security.TokenBlacklist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.*;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ SECURITY: Rate limiter — max 5 failed login attempts per 15 minutes
    @Autowired
    private LoginRateLimiter loginRateLimiter;

    // ✅ SECURITY: Token blacklist — invalidates JWT on logout
    @Autowired
    private TokenBlacklist tokenBlacklist;

    // BCrypt encoder — cost factor 12 for strong security
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    // ─────────────────────────────────────────────────────────────────────────
    // POST: /init-admin  ← ONE-TIME BOOTSTRAP ENDPOINT
    //
    // Creates the first admin user when the database is completely empty.
    // ✅ SAFE: Refuses to run if ANY user already exists.
    // 🔒 IMPORTANT: Delete or disable this endpoint after first login!
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/init-admin")
    public ResponseEntity<?> initAdmin(@RequestBody Map<String, String> body) {
        // Block if even ONE user already exists — prevents misuse
        if (userRepository.count() > 0) {
            return ResponseEntity.status(403).body(
                Map.of("message", "❌ Init blocked: Users already exist in the database. This endpoint is disabled.")
            );
        }

        String username = body.get("username");
        String password = body.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("message", "username and password are required"));
        }
        if (password.length() < 6) {
            return ResponseEntity.status(400).body(Map.of("message", "Password must be at least 6 characters"));
        }

        User admin = new User();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));  // BCrypt hashed
        admin.setRole("admin");
        admin.setShopId(null);
        userRepository.save(admin);

        return ResponseEntity.ok(Map.of(
            "message", "✅ Admin user created successfully! You can now login.",
            "username", username,
            "role", "admin",
            "next_step", "After logging in, use /register to add more users, then disable /init-admin."
        ));
    }

    // GET: Saare users ki list
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestAttribute("role") String role) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can view user list");
        }
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
        return ResponseEntity.ok(result);
    }

    // POST: User Registration — password is BCrypt hashed before saving
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestAttribute("role") String role, @RequestBody Map<String, Object> body) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body("Access Denied: Only Admin can register new users");
        }
        String username = (String) body.get("username");
        String rawPassword = (String) body.get("password");
        String roleParam = (String) body.get("role");
        Object shopIdObj = body.get("shop_id");
        String shopId = shopIdObj != null ? shopIdObj.toString() : null;

        if (username == null || username.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("message", "Username and password are required"));
        }

        if (rawPassword.length() < 6) {
            return ResponseEntity.status(400).body(Map.of("message", "Password must be at least 6 characters"));
        }

        // Check if user already exists
        Optional<User> existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            return ResponseEntity.status(401).body(Map.of("message", "Username already taken!"));
        }

        User user = new User();
        user.setUsername(username);
        // ✅ SECURITY FIX: Hash password with BCrypt before saving
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(roleParam);
        user.setShopId(shopId);

        User saved = userRepository.save(user);

        // Return user info without the password hash
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", saved.getUserId());
        response.put("username", saved.getUsername());
        response.put("role", saved.getRole());
        response.put("shop_id", saved.getShopId());
        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }

    // POST: Login — compare BCrypt hash, not plaintext
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String rawPassword = body.get("password");

        if (username == null || rawPassword == null) {
            return ResponseEntity.status(400).body("Username and password are required");
        }

        // ✅ SECURITY: Check rate limit BEFORE database lookup
        if (loginRateLimiter.isBlocked(username)) {
            long remaining = loginRateLimiter.getRemainingLockoutSeconds(username);
            return ResponseEntity.status(429).body(Map.of(
                "message", "Too many failed login attempts. Account temporarily locked.",
                "retry_after_seconds", remaining
            ));
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            // Record failure even for non-existent users (prevents username enumeration timing)
            loginRateLimiter.recordFailure(username);
            // Return same generic message as wrong password to prevent username enumeration
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        User user = userOpt.get();
        // ✅ SECURITY FIX: Use BCrypt matches() to verify password against the stored hash
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            // ✅ SECURITY: Record failed attempt for rate limiting
            loginRateLimiter.recordFailure(username);
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        // ✅ SECURITY: Reset failure count on successful login
        loginRateLimiter.recordSuccess(username);

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

    // ─────────────────────────────────────────────────────────────────────────
    // POST: /logout
    //
    // ✅ SECURITY: Blacklist the current JWT so it cannot be reused after logout.
    // The frontend must send the token in the Authorization header as usual.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // The raw token was stored as a request attribute by JwtFilter
        String token = (String) request.getAttribute("rawToken");

        if (token != null && !token.isEmpty()) {
            // Get token expiry so we know when to clean it from the blacklist
            Date expiry = jwtUtil.extractExpiration(token);
            Instant expiresAt = (expiry != null) ? expiry.toInstant() : Instant.now().plusSeconds(86400);
            tokenBlacklist.blacklist(token, expiresAt);
        }

        return ResponseEntity.ok(Map.of("message", "Logged out successfully. Token has been revoked."));
    }

    // DELETE: User delete karo by ID
    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@RequestAttribute("role") String role, @PathVariable Integer id) {
        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access Denied: Only Admin can delete users"));
        }
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
