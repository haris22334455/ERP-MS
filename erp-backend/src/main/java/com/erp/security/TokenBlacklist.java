package com.erp.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ✅ SECURITY: In-memory JWT Blacklist for token revocation on logout.
 *
 * When a user logs out, their JWT token is added to this blacklist.
 * The JwtFilter checks this blacklist on every request and rejects
 * blacklisted tokens even if they are still cryptographically valid.
 *
 * Tokens are automatically purged from the blacklist after their
 * natural expiry time (24h by default) to prevent unbounded memory growth.
 *
 * NOTE: This is an in-memory implementation. On multi-instance deployments,
 * replace with a Redis-backed solution for cross-instance consistency.
 */
@Component
public class TokenBlacklist {

    // Map: token -> expiry time (so we can clean up expired tokens)
    private final Map<String, Instant> blacklist = new ConcurrentHashMap<>();

    /**
     * Add a token to the blacklist until its expiry time.
     *
     * @param token      the raw JWT token string
     * @param expiresAt  the time at which the token naturally expires
     */
    public void blacklist(String token, Instant expiresAt) {
        blacklist.put(token, expiresAt);
        // Proactively clean up expired tokens to prevent memory leaks
        purgeExpired();
    }

    /**
     * Check whether a token has been blacklisted.
     *
     * @param token the raw JWT token string
     * @return true if the token is blacklisted
     */
    public boolean isBlacklisted(String token) {
        Instant expiry = blacklist.get(token);
        if (expiry == null) return false;

        // If the token's natural expiry has passed, it's no longer a concern
        if (Instant.now().isAfter(expiry)) {
            blacklist.remove(token);
            return false;
        }

        return true;
    }

    /**
     * Remove all tokens that have already expired naturally.
     * Called automatically on each blacklist() call.
     */
    private void purgeExpired() {
        Instant now = Instant.now();
        blacklist.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
    }
}
