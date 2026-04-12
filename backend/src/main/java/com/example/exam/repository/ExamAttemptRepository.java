package com.example.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.exam.model.ExamAttempt;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {

    Optional<ExamAttempt> findByUserIdAndExamIdAndStatus(Long userId, Long examId, String status);

    List<ExamAttempt> findByUserIdAndStatus(Long userId, String status);

    List<ExamAttempt> findByExamIdAndStatus(Long examId, String status);

    List<ExamAttempt> findByStatusOrderByScoreDesc(String status);
}

