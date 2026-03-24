package com.example.exam.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.exam.model.User;
import com.example.exam.repository.UserRepository;
import com.example.exam.service.EmailService;
import com.example.exam.service.OtpService;

@RestController
@RequestMapping("api/auth")
public class PasswordResetController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetController(UserRepository userRepository,
                                   OtpService otpService,
                                   EmailService emailService,
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.otpService = otpService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Step 1: User enters email → validate user exists → send OTP
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        logger.info("Forgot password request for email: {}", email);

        Map<String, String> response = new HashMap<>();

        if (email == null || email.trim().isEmpty()) {
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }

        // Check if user exists
        if (userRepository.findByEmail(email.trim()).isEmpty()) {
            response.put("message", "No account found with this email");
            return ResponseEntity.badRequest().body(response);
        }

        // Generate and send OTP
        String otp = otpService.generateOtp(email.trim());
        emailService.sendOtpEmail(email.trim(), otp);

        response.put("message", "OTP sent to your email");
        return ResponseEntity.ok(response);
    }

    /**
     * Step 2: User enters OTP → validate it
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        Map<String, String> response = new HashMap<>();

        if (email == null || otp == null) {
            response.put("message", "Email and OTP are required");
            return ResponseEntity.badRequest().body(response);
        }

        if (!otpService.validateOtp(email.trim(), otp.trim())) {
            response.put("message", "Invalid or expired OTP");
            return ResponseEntity.badRequest().body(response);
        }

        response.put("message", "OTP verified successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Step 3: User sets new password → re-validate OTP → save
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        Map<String, String> response = new HashMap<>();

        if (email == null || otp == null || newPassword == null) {
            response.put("message", "Email, OTP, and new password are required");
            return ResponseEntity.badRequest().body(response);
        }

        if (newPassword.trim().length() < 6) {
            response.put("message", "Password must be at least 6 characters");
            return ResponseEntity.badRequest().body(response);
        }

        // Re-validate OTP before resetting
        if (!otpService.validateOtp(email.trim(), otp.trim())) {
            response.put("message", "Invalid or expired OTP. Please request a new one.");
            return ResponseEntity.badRequest().body(response);
        }

        // Update password
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Clear OTP after successful reset
        otpService.clearOtp(email.trim());

        logger.info("Password reset successful for email: {}", email);
        response.put("message", "Password reset successful");
        return ResponseEntity.ok(response);
    }
}
