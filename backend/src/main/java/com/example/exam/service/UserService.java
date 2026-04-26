package com.example.exam.service;

import java.util.List;

import com.example.exam.dto.LoginRequest;
import com.example.exam.dto.RegisterRequest;
import com.example.exam.dto.UpdateProfileRequest;
import com.example.exam.model.Role;
import com.example.exam.model.User;

public interface UserService {
    
    User register(RegisterRequest request);
    
    User login(LoginRequest request);
    
    User getUserByEmail(String email);
    
    User updateUser(String email, UpdateProfileRequest request);
    
    void deleteUser(String email);
    
    List<User> getAllUsers();
    
    User updateUserRole(String email, Role role);
}
