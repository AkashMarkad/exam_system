package com.example.exam.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.exam.dto.LoginRequest;
import com.example.exam.dto.RegisterRequest;
import com.example.exam.dto.UpdateProfileRequest;
import com.example.exam.model.Role;
import com.example.exam.model.User;
import com.example.exam.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
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

    @Override
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

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateUser(String email, UpdateProfileRequest request) {
        logger.info("Updating user profile for email: {}", email);
        logger.info("New name: {}, New password provided: {}", request.getName(), request.getNewPassword() != null && !request.getNewPassword().isEmpty());
        
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
            logger.info("Saving updated user to repository: {}", email);
            User savedUser = userRepository.save(user);
            logger.info("User saved successfully: {}", savedUser.getName());
            return savedUser;
        }

        logger.info("No updates detected for user: {}", email);
        return user;
    }

    @Override
    public void deleteUser(String email) {
        User user = getUserByEmail(email);
        logger.info("Deleting user: {}", email);
        userRepository.delete(user);
    }

    @Override
    public java.util.List<User> getAllUsers() {
        return (java.util.List<User>) userRepository.findAll();
    }

    @Override
    public User updateUserRole(String email, Role newRole) {
        User user = getUserByEmail(email);
        user.setRole(newRole);
        return userRepository.save(user);
    }
}
