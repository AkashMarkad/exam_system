package com.example.exam.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.exam.dto.LoginRequest;
import com.example.exam.dto.RegisterRequest;
import com.example.exam.dto.UpdateProfileRequest;
import com.example.exam.model.Role;
import com.example.exam.model.User;
import com.example.exam.repository.UserRepository;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User register(RegisterRequest request) {
        logger.info("Checking if email already exists: {}", request.getEmail());
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            logger.warn("Registration failed - email already registered: {}", request.getEmail());
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        // logger.info("User registered successfully: {} (ID: {})",
        // savedUser.getEmail(), savedUser.getId());
        return savedUser;
    }

    public User login(LoginRequest request) {
        logger.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.warn("Login failed - email not found: {}", request.getEmail());
                    return new RuntimeException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.warn("Login failed - incorrect password for email: {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        // logger.info("Login successful for email: {}", user.getEmail());
        return user;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);
        boolean updated = false;

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
            updated = true;
        }

        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            updated = true;
        }

        if (updated) {
            logger.info("Updating profile for user: {}", email);
            return userRepository.save(user);
        }

        return user;
    }

    public void deleteUser(String email) {
        User user = getUserByEmail(email);
        logger.info("Deleting user: {}", email);
        userRepository.delete(user);
    }
}
