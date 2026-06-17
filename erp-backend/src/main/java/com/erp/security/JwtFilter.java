package com.erp.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ SECURITY: Blacklist check — reject logged-out tokens
    @Autowired
    private TokenBlacklist tokenBlacklist;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // CORS preflight requests bypass validation
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = request.getHeader("Authorization");

        if (token != null && !token.isEmpty()) {
            // ✅ SECURITY: Check if token has been blacklisted (user logged out)
            if (tokenBlacklist.isBlacklisted(token)) {
                response.setStatus(401);
                response.getWriter().write("Token has been revoked. Please login again.");
                return;
            }

            try {
                Claims claims = jwtUtil.extractClaims(token);
                request.setAttribute("userId", claims.get("id"));
                request.setAttribute("role", claims.get("role"));
                // Store the raw token so controllers can blacklist it on logout
                request.setAttribute("rawToken", token);
            } catch (Exception e) {
                response.setStatus(401);
                response.getWriter().write("Invalid Token");
                return;
            }
        } else {
            response.setStatus(401);
            response.getWriter().write("Authorization Token Required");
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // /login and /init-admin are public — no JWT needed
        // /init-admin is self-protected: it blocks itself if any user exists
        return path.equals("/") || path.equals("/login") || path.equals("/init-admin");
    }
}
