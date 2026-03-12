package com.example.exam.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.exam.dto.AuthResponse;
import com.example.exam.dto.LoginRequest;
import com.example.exam.dto.RegisterRequest;
import com.example.exam.dto.UpdateProfileRequest;
import com.example.exam.model.User;
import com.example.exam.service.UserService;
import com.example.exam.util.JwtUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RequestMapping("api/auth")
@RestController
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {

        logger.info("Register request received for email: {}", request.getEmail());

        try {
            User user = userService.register(request);
            String token = jwtUtil.generateToken(user.getEmail());

            addJwtCookie(response, token);

            AuthResponse authResponse = new AuthResponse(
                    "Registration successful",
                    user.getName(),
                    user.getEmail(),
                    user.getRole().name());

            logger.info("Registration successful for email: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
        } catch (Exception e) {
            logger.error("Registration failed for email: {} - {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {

        logger.info("Login request received for email: {}", request.getEmail());

        try {
            User user = userService.login(request);
            String token = jwtUtil.generateToken(user.getEmail());

            addJwtCookie(response, token);

            AuthResponse authResponse = new AuthResponse(
                    "Login successful",
                    user.getName(),
                    user.getEmail(),
                    user.getRole().name());

            logger.info("Login successful for email: {}", user.getEmail());
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            logger.error("Login failed for email: {} - {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    private void addJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 1 day
        response.addCookie(cookie);
    }

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // clear cookie
        response.addCookie(cookie);
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@CookieValue(value = "jwt", defaultValue = "") String token) {
        if (token.isEmpty() || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = jwtUtil.extractEmail(token);
        User user = userService.getUserByEmail(email);
        user.setPassword(null); // Don't send password back
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @CookieValue(value = "jwt", defaultValue = "") String token) {
        
        if (token.isEmpty() || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = jwtUtil.extractEmail(token);
        User updatedUser = userService.updateUser(email, request);
        updatedUser.setPassword(null);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Map<String, String>> deleteProfile(
            @CookieValue(value = "jwt", defaultValue = "") String token,
            HttpServletResponse response) {
        
        if (token.isEmpty() || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = jwtUtil.extractEmail(token);
        userService.deleteUser(email);
        clearJwtCookie(response);
        
        Map<String, String> res = new HashMap<>();
        res.put("message", "Profile deleted successfully");
        return ResponseEntity.ok(res);
    }
}
