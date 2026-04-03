package com.example.exam.controller;

import com.example.exam.model.Exam;
import com.example.exam.service.ExamService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ExamController {

    @Autowired
    private ExamService examService;

    @PostMapping(value = "/create-with-questions", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> createExamWithQuestions(
            @RequestPart("exam") String examJson,
            @RequestPart("file") MultipartFile file,
            @RequestParam("uploadType") String uploadType) {
        
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty.");
        }

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();

            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule()); // Support for LocalDateTime
            Exam exam = objectMapper.readValue(examJson, Exam.class);

            Exam savedExam = examService.createExamWithQuestions(exam, file, uploadType, userEmail);
            return ResponseEntity.ok("Exam created successfully with ID: " + savedExam.getId());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create exam: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllExams() {
        try {
            return ResponseEntity.ok(examService.getAllExams());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch exams: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExam(@PathVariable("id") Long id, @RequestBody Exam examDetails) {
        try {
            Exam updatedExam = examService.updateExam(id, examDetails);
            return ResponseEntity.ok(updatedExam);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update exam: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable("id") Long id) {
        try {
            examService.deleteExam(id);
            return ResponseEntity.ok("Exam deleted successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete exam: " + e.getMessage());
        }
    }
}
