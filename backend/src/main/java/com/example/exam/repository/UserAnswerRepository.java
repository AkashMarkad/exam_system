package com.example.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.exam.model.UserAnswer;
import java.util.List;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    
    List<UserAnswer> findByAttemptId(Long attemptId);
    void deleteByAttemptId(Long attemptId);
}
