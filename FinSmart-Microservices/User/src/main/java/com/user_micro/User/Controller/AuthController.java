package com.user_micro.User.Controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.user_micro.User.Model.User;
import com.user_micro.User.Security.JwtUtil;
import com.user_micro.User.Service.CustomUserDetailsService;
import com.user_micro.User.Service.UserService;

@CrossOrigin(origins = "http://localhost",  allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserService userService;

    public AuthController(AuthenticationManager authManager, JwtUtil jwtUtil, CustomUserDetailsService userDetailsService, UserService userService) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            User user = userService.getUserByUsername(username);
            Long userId = user.getId();
            String token = jwtUtil.generateToken(userDetails, userId);
            return ResponseEntity.ok(Map.of("token", token, "userId", userId));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        log.info("Received forgot-password request for email={}", email);
        
        if (email == null || email.trim().isEmpty()) {
            log.warn("Forgot-password request received with missing email");
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        try {
            userService.sendPasswordResetCode(email.trim());
            // Always return success message for security (don't reveal if email exists)
            return ResponseEntity.ok(Map.of("message", "If an account exists with this email, a reset code has been sent."));
        } catch (Exception e) {
            log.error("Error sending password reset code", e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send reset code. Please try again later."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String resetCode = body.get("resetCode");
        String newPassword = body.get("newPassword");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        if (resetCode == null || resetCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reset code is required"));
        }
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters long"));
        }

        try {
            userService.resetPassword(email.trim(), resetCode.trim(), newPassword);
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
        } catch (IllegalArgumentException e) {
            log.warn("Password reset failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error resetting password", e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to reset password. Please try again."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Validated @RequestBody User user) {
        try {
            User created = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            log.warn("User creation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error registering user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to register user"));
        }
    }
}