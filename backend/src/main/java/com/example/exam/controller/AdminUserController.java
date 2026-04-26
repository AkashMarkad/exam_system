package com.example.exam.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.exam.model.Role;
import com.example.exam.model.User;
import com.example.exam.service.UserService;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        // Remove passwords before returning
        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{email}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable("email") String email,
            @RequestBody Map<String, String> request) {
        
        String roleStr = request.get("role");
        if (roleStr == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Role newRole = Role.valueOf(roleStr.toUpperCase());
            User updatedUser = userService.updateUserRole(email, newRole);
            updatedUser.setPassword(null);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable("email") String email) {
        userService.deleteUser(email);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
