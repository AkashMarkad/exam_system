package com.example.exam.dto;

import java.util.List;
import java.util.Map;

public class SubmitExamRequest {
    private Long attemptId;
    private Map<Long, List<Long>> answers; // questionId -> list of optionId

    public SubmitExamRequest() {}

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }
    public Map<Long, List<Long>> getAnswers() { return answers; }
    public void setAnswers(Map<Long, List<Long>> answers) { this.answers = answers; }
}
