package com.example.exam.dto;

public class StartExamResponse {
    private Long attemptId;
    private ExamExecutionDto exam;
    private Long remainingTimeSeconds; // Help resume existing attempts nicely

    public StartExamResponse(Long attemptId, ExamExecutionDto exam, Long remainingTimeSeconds) {
        this.attemptId = attemptId;
        this.exam = exam;
        this.remainingTimeSeconds = remainingTimeSeconds;
    }

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }
    public ExamExecutionDto getExam() { return exam; }
    public void setExam(ExamExecutionDto exam) { this.exam = exam; }
    public Long getRemainingTimeSeconds() { return remainingTimeSeconds; }
    public void setRemainingTimeSeconds(Long remainingTimeSeconds) { this.remainingTimeSeconds = remainingTimeSeconds; }
}
