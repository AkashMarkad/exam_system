package com.example.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.exam.model.ExamAttempt;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {

    Optional<ExamAttempt> findByUserIdAndExamIdAndStatus(Long userId, Long examId, String status);
    
    java.util.List<ExamAttempt> findByUserIdAndStatus(Long userId, String status);

}
