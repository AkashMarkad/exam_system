package com.example.exam.service;

import com.example.exam.dto.StartExamResponse;
import com.example.exam.dto.SubmitExamRequest;
import java.util.List;
import java.util.Map;

public interface AttemptService {

    StartExamResponse startAttempt(Long examId, String email);

    Map<String, Object> submitAttempt(SubmitExamRequest request, String email);

    List<Map<String, Object>> getUserResults(String email);

    List<Map<String, Object>> getAllResults();
}
