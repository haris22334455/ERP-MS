package com.erp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey getSigningKey() {
        try {
            // ✅ SECURITY FIX: Use SHA-256 to derive a proper 256-bit key from the secret string.
            // This ensures the key is always exactly 32 bytes regardless of secret length,
            // and is cryptographically derived (not just a simple byte copy/pad).
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create JWT signing key", e);
        }
    }

    public String generateToken(Integer userId, String role) {
        return Jwts.builder()
                .claim("id", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = extractClaims(token);
            // Extra check: ensure token is not expired
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extract the expiration date from the token.
     * Used by the logout endpoint to know until when to keep the token blacklisted.
     *
     * @param token the raw JWT string
     * @return the expiration date, or null if token is invalid
     */
    public Date extractExpiration(String token) {
        try {
            return extractClaims(token).getExpiration();
        } catch (Exception e) {
            return null;
        }
    }
}
