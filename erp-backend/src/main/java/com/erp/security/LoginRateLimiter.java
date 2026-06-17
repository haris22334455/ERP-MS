package com.erp.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ✅ SECURITY: In-memory login rate limiter.
 *
 * Tracks failed login attempts per username (case-insensitive).
 * After MAX_ATTEMPTS failures within WINDOW_SECONDS, the account is
 * temporarily locked for LOCKOUT_SECONDS.
 *
 * NOTE: This is an in-memory implementation. On multi-instance deployments,
 * replace with a Redis-backed solution (e.g., Spring Cache + Lettuce).
 */
@Component
public class LoginRateLimiter {

    // Maximum consecutive failures before lockout
    private static final int MAX_ATTEMPTS = 5;

    // Time window for counting failures (15 minutes in seconds)
    private static final long WINDOW_SECONDS = 15 * 60;

    // How long the account stays locked after exceeding MAX_ATTEMPTS (15 minutes)
    private static final long LOCKOUT_SECONDS = 15 * 60;

    private static class AttemptRecord {
        int count = 0;
        Instant windowStart = Instant.now();
        Instant lockedUntil = null;
    }

    // ConcurrentHashMap is thread-safe for multi-threaded Spring requests
    private final Map<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    /**
     * Check if the given username is currently rate-limited/locked.
     *
     * @param username the username to check
     * @return true if the username is blocked (too many failures)
     */
    public boolean isBlocked(String username) {
        AttemptRecord record = attempts.get(username.toLowerCase());
        if (record == null) return false;

        // If locked, check if lockout period has expired
        if (record.lockedUntil != null) {
            if (Instant.now().isBefore(record.lockedUntil)) {
                return true; // Still locked
            } else {
                // Lockout expired — reset and allow
                attempts.remove(username.toLowerCase());
                return false;
            }
        }

        // If within the window but under limit, not blocked
        return false;
    }

    /**
     * Record a failed login attempt for the given username.
     * Locks the account if MAX_ATTEMPTS is exceeded within the window.
     *
     * @param username the username that failed login
     */
    public void recordFailure(String username) {
        String key = username.toLowerCase();
        AttemptRecord record = attempts.computeIfAbsent(key, k -> new AttemptRecord());

        Instant now = Instant.now();

        // Reset window if it has expired
        if (now.isAfter(record.windowStart.plusSeconds(WINDOW_SECONDS))) {
            record.count = 0;
            record.windowStart = now;
            record.lockedUntil = null;
        }

        record.count++;

        // Lock the account if max attempts exceeded
        if (record.count >= MAX_ATTEMPTS) {
            record.lockedUntil = now.plusSeconds(LOCKOUT_SECONDS);
        }
    }

    /**
     * Record a successful login — reset the failure counter.
     *
     * @param username the username that successfully logged in
     */
    public void recordSuccess(String username) {
        attempts.remove(username.toLowerCase());
    }

    /**
     * Returns how many seconds remain on the lockout for the given username.
     * Returns 0 if not locked.
     *
     * @param username the username to check
     * @return seconds remaining in lockout
     */
    public long getRemainingLockoutSeconds(String username) {
        AttemptRecord record = attempts.get(username.toLowerCase());
        if (record == null || record.lockedUntil == null) return 0;
        long remaining = record.lockedUntil.getEpochSecond() - Instant.now().getEpochSecond();
        return Math.max(0, remaining);
    }
}
