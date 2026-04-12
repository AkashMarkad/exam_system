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
            long elapsedSeconds = ChronoUnit.SECONDS.between(attempt.getStartTime(), now);
            long totalSeconds = exam.getDurationMinutes() * 60L;
            remainingTimeSeconds = Math.max(0, totalSeconds - elapsedSeconds);

            // Bug fix: if time has already expired, auto-complete the stale attempt
            if (remainingTimeSeconds == 0) {
                attempt.setEndTime(now);
                attempt.setScore(0);
                attempt.setStatus("completed");
                attemptRepository.save(attempt);
                throw new RuntimeException("Exam time has already expired. Your attempt has been recorded.");
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
            // Already submitted — return gracefully instead of throwing an error
            Exam examForResult = examRepository.findById(attempt.getExamId())
                    .orElseThrow(() -> new RuntimeException("Exam not found"));
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Exam already submitted");
            result.put("score", attempt.getScore());
            result.put("totalMarks", examForResult.getTotalMarks());
            return result;
        }

        Exam exam = examRepository.findById(attempt.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Delete previous answers if any
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
            Optional<Exam> examOpt = examRepository.findById(attempt.getExamId());
            if (examOpt.isPresent()) {
                Exam exam = examOpt.get();
                Map<String, Object> map = new HashMap<>();
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
                Optional<Exam> examOpt = examRepository.findById(attempt.getExamId());
                Optional<User> userOpt = userRepository.findById(attempt.getUserId());

                if (examOpt.isPresent() && userOpt.isPresent()) {
                    Exam exam = examOpt.get();
                    User user = userOpt.get();
                    Map<String, Object> map = new HashMap<>();
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

    @Override
    public List<Map<String, Object>> getLeaderboard() {
        List<ExamAttempt> attempts = attemptRepository.findByStatusOrderByScoreDesc("completed");
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        int rank = 1;

        for (ExamAttempt attempt : attempts) {
            Optional<Exam> examOpt = examRepository.findById(attempt.getExamId());
            Optional<User> userOpt = userRepository.findById(attempt.getUserId());

            if (examOpt.isPresent() && userOpt.isPresent()) {
                Exam exam = examOpt.get();
                User user = userOpt.get();
                double percentage = exam.getTotalMarks() > 0
                        ? Math.round(((double) attempt.getScore() / exam.getTotalMarks()) * 1000.0) / 10.0
                        : 0.0;

                Map<String, Object> entry = new HashMap<>();
                entry.put("rank", rank++);
                entry.put("studentName", user.getName());
                entry.put("studentEmail", user.getEmail());
                entry.put("examId", exam.getId());
                entry.put("examName", exam.getName());
                entry.put("score", attempt.getScore());
                entry.put("totalMarks", exam.getTotalMarks());
                entry.put("percentage", percentage);
                entry.put("completedAt", attempt.getEndTime());
                leaderboard.add(entry);
            }
        }
        return leaderboard;
    }

    @Override
    public List<Map<String, Object>> getLeaderboardByExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        List<ExamAttempt> attempts = new ArrayList<>(
                attemptRepository.findByExamIdAndStatus(examId, "completed"));
        attempts.sort((a, b) -> Integer.compare(
                b.getScore() != null ? b.getScore() : 0,
                a.getScore() != null ? a.getScore() : 0));

        List<Map<String, Object>> leaderboard = new ArrayList<>();
        int rank = 1;

        for (ExamAttempt attempt : attempts) {
            Optional<User> userOpt = userRepository.findById(attempt.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                double percentage = exam.getTotalMarks() > 0
                        ? Math.round(((double) attempt.getScore() / exam.getTotalMarks()) * 1000.0) / 10.0
                        : 0.0;

                Map<String, Object> entry = new HashMap<>();
                entry.put("rank", rank++);
                entry.put("studentName", user.getName());
                entry.put("studentEmail", user.getEmail());
                entry.put("examId", exam.getId());
                entry.put("examName", exam.getName());
                entry.put("score", attempt.getScore());
                entry.put("totalMarks", exam.getTotalMarks());
                entry.put("percentage", percentage);
                entry.put("completedAt", attempt.getEndTime());
                leaderboard.add(entry);
            }
        }
        return leaderboard;
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
