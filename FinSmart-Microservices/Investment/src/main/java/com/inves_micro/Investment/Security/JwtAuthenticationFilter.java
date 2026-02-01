package com.inves_micro.Investment.Security;

import java.io.IOException;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger LOG = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {


         // Add this first
        LOG.info("Incoming request: {} {} Authorization={}",
                request.getMethod(),
                request.getRequestURI(),
                request.getHeader("Authorization"));
        try {
            String token = extractTokenFromRequest(request);

            if (token == null) {
                // No token provided, continue and let Spring Security handle unauthenticated request
                LOG.debug("No JWT token found in request for {} {}", request.getMethod(), request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            // Token present: validate it or reject immediately
            if (!jwtUtil.validateToken(token)) {
                LOG.warn("Invalid or expired JWT token provided for request {} {}", request.getMethod(), request.getRequestURI());
                // Return a simple JSON 401 response and avoid error dispatch to /error
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                String body = "{\"error\":\"Invalid or expired JWT token\"}";
                response.getWriter().write(body);
                response.getWriter().flush();
                return;
            }

            // Token valid -> set authentication
            String username = jwtUtil.extractUsername(token);
            Long userId = jwtUtil.extractUserId(token);

            JwtUserDetails userDetails = new JwtUserDetails(username, userId);
            Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, new ArrayList<>());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            LOG.info("JWT Authentication successful for user: {}", username);

        } catch (Exception e) {
            LOG.error("Cannot set user authentication: {}", e.toString());
            // Fail closed: respond unauthorized with JSON body
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            String body = "{\"error\":\"Failed to authenticate JWT token\",\"message\":\"" + e.getMessage() + "\"}";
            try {
                response.getWriter().write(body);
                response.getWriter().flush();
            } catch (IOException ioex) {
                LOG.error("Failed to write error response: {}", ioex.toString());
            }
            return;
        }

        filterChain.doFilter(request, response);
    }

    // Extract JWT token from Authorization header
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
