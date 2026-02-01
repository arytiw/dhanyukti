package com.user_micro.User.Service.ServiceImpl;

import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.user_micro.User.Model.PasswordResetCode;
import com.user_micro.User.Model.User;
import com.user_micro.User.Repository.PasswordResetCodeRepository;
import com.user_micro.User.Repository.UserRepository;
import com.user_micro.User.Service.EmailService;
import com.user_micro.User.Service.UserService;


@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userepo;
    private final PasswordResetCodeRepository resetCodeRepo;
    private final EmailService emailService;
    private final Random random = new Random();

    public UserServiceImpl(UserRepository userepo, PasswordResetCodeRepository resetCodeRepo, EmailService emailService) {
        this.userepo = userepo;
        this.resetCodeRepo = resetCodeRepo;
        this.emailService = emailService;
    }

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    

    @Override
    public User createUser(User u) {
        if (u == null) {
            log.error("Creation of the User failed as User object is NULL");
            throw new IllegalArgumentException("User object is required");
        }

        // Normalize and trim inputs
        if (u.getEmail() == null || u.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        u.setEmail(u.getEmail().toLowerCase().trim());
        if (u.getUsername() == null || u.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }
        u.setUsername(u.getUsername().trim());

        // Pre-check uniqueness to provide a clear error message
        if (userepo.existsByEmail(u.getEmail())) {
            log.warn("Email {} already exists", u.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }

        if (userepo.existsByUsername(u.getUsername())) {
            log.warn("Username {} already exists", u.getUsername());
            throw new IllegalArgumentException("Username already exists");
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        u.setPassword(encoder.encode(u.getPassword()));

        try {
            return userepo.save(u);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Catch any DB constraint issues (race conditions) and translate to a user-friendly error
            log.error("Database constraint violated while saving user: {}", u.getEmail(), e);
            throw new IllegalArgumentException("Email or username already exists");
        }
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userepo.findById(id);
    }

    @Override
    public List<User> getAllUser() {
        return userepo.findAll();
    }

    
   

    

    @Override
    public User getUserByUsername(String username) {
        log.info("getUserByUsername() called with username={}", username);
        User user = userepo.findByUsername(username);
        if(user == null){
            log.error("User not found: {}", username);
        }
        return user;
    }

    @Override
    public User getUserByEmail(String email) {
        log.info("getUserByEmail() called with email={}", email);
        User user = userepo.findByEmail(email);
        if(user == null){
            log.error("User not found with email: {}", email);
        }
        return user;
    }

    @Override
    @Transactional
    public void sendPasswordResetCode(String email) {
        log.info("Sending password reset code to email: {}", email);
        
        User user = getUserByEmail(email);
        if (user == null) {
            log.warn("Password reset requested for non-existent email: {}", email);
            // Don't reveal if email exists or not for security
            return;
        }

        log.info("Creating password reset code for email={}", email);
        // Generate 6-digit code
        String resetCode = String.format("%06d", random.nextInt(1000000));
        log.debug("Generated reset code={} for email={}", resetCode, email);
        
        // Save reset code
        PasswordResetCode resetCodeEntity = new PasswordResetCode(email, resetCode);
        resetCodeRepo.save(resetCodeEntity);
        log.info("Saved password reset code entity for email={}", email);
        
        log.info("Attempting to send reset email to {}", email);
        // Send email
        emailService.sendPasswordResetCode(email, resetCode);
        log.info("Password reset code sent successfully to {}", email);
    }

    @Override
    @Transactional
    public void resetPassword(String email, String resetCode, String newPassword) {
        log.info("Resetting password for email: {}", email);
        
        // Find valid reset code
        Optional<PasswordResetCode> codeOpt = resetCodeRepo.findByEmailAndCodeAndUsedFalse(email, resetCode);
        
        if (codeOpt.isEmpty()) {
            log.warn("Invalid or expired reset code for email: {}", email);
            throw new IllegalArgumentException("Invalid or expired reset code");
        }
        
        PasswordResetCode resetCodeEntity = codeOpt.get();
        
        // Check if code is expired
        if (resetCodeEntity.isExpired()) {
            log.warn("Expired reset code used for email: {}", email);
            throw new IllegalArgumentException("Reset code has expired");
        }
        
        // Check if code is already used
        if (resetCodeEntity.isUsed()) {
            log.warn("Already used reset code attempted for email: {}", email);
            throw new IllegalArgumentException("Reset code has already been used");
        }
        
        // Find user
        User user = getUserByEmail(email);
        if (user == null) {
            log.error("User not found for email: {}", email);
            throw new IllegalArgumentException("User not found");
        }
        
        // Update password
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        user.setPassword(encoder.encode(newPassword));
        userepo.save(user);
        
        // Mark code as used
        resetCodeEntity.setUsed(true);
        resetCodeRepo.save(resetCodeEntity);
        
        log.info("Password reset successfully for email: {}", email);
    }
}
