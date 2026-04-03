package com.example.exam.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.exam.dto.StartExamResponse;
import com.example.exam.dto.SubmitExamRequest;
import com.example.exam.service.AttemptService;

import com.example.exam.model.User;
import com.example.exam.model.Role;
import com.example.exam.service.UserService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

    private static final Logger logger = LoggerFactory.getLogger(AttemptController.class);
    private final AttemptService attemptService;
    private final UserService userService;

    public AttemptController(AttemptService attemptService, UserService userService) {
        this.attemptService = attemptService;
        this.userService = userService;
    }

    private String getAuthenticatedEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @PostMapping("/start/{examId}")
    public ResponseEntity<StartExamResponse> startAttempt(@PathVariable("examId") Long examId) {
        String email = getAuthenticatedEmail();
        logger.info("User {} starting exam {}", email, examId);
        StartExamResponse response = attemptService.startAttempt(examId, email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitAttempt(@RequestBody SubmitExamRequest request) {
        String email = getAuthenticatedEmail();
        logger.info("User {} submitting attempt {}", email, request.getAttemptId());
        Map<String, Object> response = attemptService.submitAttempt(request, email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-results")
    public ResponseEntity<List<Map<String, Object>>> getMyResults() {
        String email = getAuthenticatedEmail();
        logger.info("User {} fetching results", email);
        return ResponseEntity.ok(attemptService.getUserResults(email));
    }

    @GetMapping("/all-results")
    public ResponseEntity<List<Map<String, Object>>> getAllResults() {
        String email = getAuthenticatedEmail();
        User user = userService.getUserByEmail(email);
        
        if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        
        logger.info("Admin {} fetching all results", email);
        return ResponseEntity.ok(attemptService.getAllResults());
    }
}
