package com.example.exam.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.exam.dto.*;
import com.example.exam.model.*;
import com.example.exam.repository.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttemptServiceImpl implements AttemptService {

    private final ExamRepository examRepository;
    private final ExamAttemptRepository attemptRepository;
    private final UserAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;

    public AttemptServiceImpl(ExamRepository examRepository, 
                              ExamAttemptRepository attemptRepository,
                              UserAnswerRepository answerRepository,
                              UserRepository userRepository,
                              QuestionRepository questionRepository) {
        this.examRepository = examRepository;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    @Transactional
    public StartExamResponse startAttempt(Long examId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime()) || now.isAfter(exam.getEndTime())) {
            throw new RuntimeException("Exam is not currently active.");
        }

        // Check for existing in-progress attempt
        Optional<ExamAttempt> existingAttempt = attemptRepository
                .findByUserIdAndExamIdAndStatus(user.getId(), exam.getId(), "in_progress");

        ExamAttempt attempt;
        Long remainingTimeSeconds;

        if (existingAttempt.isPresent()) {
            attempt = existingAttempt.get();
            // Calculate remaining time
            long elapsedSeconds = ChronoUnit.SECONDS.between(attempt.getStartTime(), now);
            long totalSeconds = exam.getDurationMinutes() * 60L;
            remainingTimeSeconds = Math.max(0, totalSeconds - elapsedSeconds);
            if (remainingTimeSeconds == 0) {
                // Time already up, auto submit (or handle error). 
                // For simplicity, let frontend submit it when time reads 0.
            }
        } else {
            // Check if already completed
            Optional<ExamAttempt> completedAttempt = attemptRepository
                .findByUserIdAndExamIdAndStatus(user.getId(), exam.getId(), "completed");
            if (completedAttempt.isPresent()) {
                throw new RuntimeException("You have already completed this exam.");
            }

            attempt = new ExamAttempt();
            attempt.setUserId(user.getId());
            attempt.setExamId(exam.getId());
            attempt.setStartTime(now);
            attempt.setStatus("in_progress");
            attempt = attemptRepository.save(attempt);
            remainingTimeSeconds = exam.getDurationMinutes() * 60L;
        }

        ExamExecutionDto executionDto = mapToExecutionDto(exam);
        return new StartExamResponse(attempt.getId(), executionDto, remainingTimeSeconds);
    }

    @Override
    @Transactional
    public Map<String, Object> submitAttempt(SubmitExamRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ExamAttempt attempt = attemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized attempt submission.");
        }

        if ("completed".equals(attempt.getStatus())) {
            throw new RuntimeException("Attempt already submitted.");
        }

        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Delete previous answers if any (in case of multiple partial saves, though we only save on submit)
        answerRepository.deleteByAttemptId(attempt.getId());

        int score = 0;
        List<UserAnswer> answersToSave = new ArrayList<>();

        if (request.getAnswers() != null) {
            for (Map.Entry<Long, Long> entry : request.getAnswers().entrySet()) {
                Long qId = entry.getKey();
                Long optId = entry.getValue();

                Question q = questionRepository.findById(qId).orElse(null);
                if (q != null && q.getExam().getId().equals(exam.getId())) {
                    UserAnswer ua = new UserAnswer();
                    ua.setAttemptId(attempt.getId());
                    ua.setQuestionId(q.getId());
                    ua.setSelectedOptionId(optId);
                    answersToSave.add(ua);

                    // Calculate score
                    if (optId != null) {
                        for (Option opt : q.getOptions()) {
                            if (opt.getId().equals(optId) && opt.getIsCorrect()) {
                                score += q.getMarks();
                                break;
                            }
                        }
                    }
                }
            }
            answerRepository.saveAll(answersToSave);
        }

        attempt.setEndTime(LocalDateTime.now());
        attempt.setScore(score);
        attempt.setStatus("completed");
        attemptRepository.save(attempt);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Exam submitted successfully");
        result.put("score", score);
        result.put("totalMarks", exam.getTotalMarks());
        return result;
    }

    @Override
    public List<Map<String, Object>> getUserResults(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ExamAttempt> attempts = attemptRepository.findByUserIdAndStatus(user.getId(), "completed");
        List<Map<String, Object>> results = new ArrayList<>();

        for (ExamAttempt attempt : attempts) {
            Map<String, Object> map = new HashMap<>();
            Optional<Exam> examOpt = examRepository.findById(attempt.getExamId());
            if (examOpt.isPresent()) {
                Exam exam = examOpt.get();
                map.put("attemptId", attempt.getId());
                map.put("examId", exam.getId());
                map.put("examName", exam.getName());
                map.put("score", attempt.getScore());
                map.put("totalMarks", exam.getTotalMarks());
                map.put("completedAt", attempt.getEndTime());
                results.add(map);
            }
        }
        return results;
    }

    @Override
    public List<Map<String, Object>> getAllResults() {
        List<ExamAttempt> attempts = attemptRepository.findAll();
        List<Map<String, Object>> results = new ArrayList<>();

        for (ExamAttempt attempt : attempts) {
            if ("completed".equalsIgnoreCase(attempt.getStatus())) {
                Map<String, Object> map = new HashMap<>();
                Optional<Exam> examOpt = examRepository.findById(attempt.getExamId());
                Optional<User> userOpt = userRepository.findById(attempt.getUserId());

                if (examOpt.isPresent() && userOpt.isPresent()) {
                    Exam exam = examOpt.get();
                    User user = userOpt.get();
                    map.put("attemptId", attempt.getId());
                    map.put("studentName", user.getName());
                    map.put("studentEmail", user.getEmail());
                    map.put("examName", exam.getName());
                    map.put("score", attempt.getScore());
                    map.put("totalMarks", exam.getTotalMarks());
                    map.put("completedAt", attempt.getEndTime());
                    results.add(map);
                }
            }
        }
        return results;
    }

    private ExamExecutionDto mapToExecutionDto(Exam exam) {
        List<QuestionExecutionDto> questions = exam.getQuestions().stream().map(q -> {
            List<OptionExecutionDto> options = q.getOptions().stream()
                    .map(opt -> new OptionExecutionDto(opt.getId(), opt.getOptionText()))
                    .collect(Collectors.toList());
            return new QuestionExecutionDto(q.getId(), q.getQuestionText(), q.getMarks(), options);
        }).collect(Collectors.toList());

        return new ExamExecutionDto(
                exam.getId(), exam.getName(), exam.getDescription(),
                exam.getDurationMinutes(), exam.getTotalMarks(), questions
        );
    }
}
