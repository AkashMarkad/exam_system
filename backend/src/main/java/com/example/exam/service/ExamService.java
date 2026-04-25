package com.example.exam.service;

import com.example.exam.model.Exam;
import com.example.exam.model.User;
import com.example.exam.repository.ExamRepository;
import com.example.exam.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuestionExcelService questionExcelService;

    @Autowired
    private QuestionPhotoService questionPhotoService;

    @CacheEvict(value = {"exams", "leaderboard"}, allEntries = true)
    @Transactional(rollbackFor = Exception.class)
    public Exam createExamWithQuestions(Exam exam, MultipartFile file, String uploadType, String userEmail) throws Exception {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new Exception("User not found"));

        exam.setCreatedBy(user.getId());
        exam.setCreatedAt(LocalDateTime.now());
        
        // Step 1: Save the Exam
        Exam savedExam = examRepository.save(exam);

        // Step 2: Extract Questions
        if ("excel".equalsIgnoreCase(uploadType)) {
            questionExcelService.processExcelFile(savedExam.getId(), file);
        } else if ("photo".equalsIgnoreCase(uploadType)) {
            questionPhotoService.processPhotoFile(savedExam.getId(), file);
        } else {
            throw new IllegalArgumentException("Invalid upload type. Must be 'excel' or 'photo'");
        }

        return savedExam;
    }

    @Cacheable(value = "exams")
    public java.util.List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    @CacheEvict(value = {"exams", "leaderboard"}, allEntries = true)
    @Transactional
    public Exam updateExam(Long id, Exam examDetails) throws Exception {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new Exception("Exam not found with id: " + id));

        exam.setName(examDetails.getName());
        exam.setDescription(examDetails.getDescription());
        exam.setDurationMinutes(examDetails.getDurationMinutes());
        exam.setTotalMarks(examDetails.getTotalMarks());
        exam.setStartTime(examDetails.getStartTime());
        exam.setEndTime(examDetails.getEndTime());
        
        return examRepository.save(exam);
    }

    @CacheEvict(value = {"exams", "leaderboard"}, allEntries = true)
    @Transactional
    public void deleteExam(Long id) throws Exception {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new Exception("Exam not found with id: " + id));
        examRepository.delete(exam);
    }
}
