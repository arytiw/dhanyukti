package com.dhan.Stonks.Config;

import com.dhan.Stonks.Security.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // CORS preflight must not require JWT (no Authorization on OPTIONS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        String jwt = null;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.warn("JWT Filter: No valid Authorization header. Path: {}", request.getRequestURI());
            sendUnauthorized(response, "Missing or invalid Authorization header");
            return;
        }

        jwt = authHeader.substring(7);

        try {
            if (!jwtUtil.validateToken(jwt)) {
                logger.warn("JWT Filter: Token validation failed (expired or invalid). Path: {}", request.getRequestURI());
                sendUnauthorized(response, "Token expired or invalid");
                return;
            }
            Long userId = jwtUtil.extractUserId(jwt);
            String username = jwtUtil.extractUsername(jwt);
            if (userId == null) {
                logger.warn("JWT Filter: No userId in token. Path: {}", request.getRequestURI());
                sendUnauthorized(response, "Invalid token claims");
                return;
            }

            UserPrincipal userPrincipal = new UserPrincipal(userId, username);
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userPrincipal, null, userPrincipal.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            chain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("JWT Filter: Exception during validation. Path: {} Error: {}", request.getRequestURI(), e.getMessage());
            sendUnauthorized(response, "Token validation failed: " + e.getMessage());
        }
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"" + message.replace("\"", "\\\"") + "\"}");
        response.getWriter().flush();
    }
}