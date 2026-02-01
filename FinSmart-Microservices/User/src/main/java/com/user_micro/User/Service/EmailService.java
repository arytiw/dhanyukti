package com.user_micro.User.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetCode(String toEmail, String resetCode) {
        try {
            log.info("Preparing password reset email for {}", toEmail);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Password Reset Code - Dhanyukti");
            message.setText(
                "Hello,\n\n" +
                "You have requested to reset your password for your Dhanyukti account.\n\n" +
                "Your password reset code is: " + resetCode + "\n\n" +
                "This code will expire in 15 minutes.\n\n" +
                "If you did not request this password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Dhanyukti Team"
            );
            message.setFrom("noreply@dhanyukti.com");
            
            log.info("Attempting to send email to {}", toEmail);
            mailSender.send(message);
            log.info("Password reset code sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", toEmail, e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}

