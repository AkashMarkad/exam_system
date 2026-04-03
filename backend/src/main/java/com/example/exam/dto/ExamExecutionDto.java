package com.example.exam.dto;

import java.util.List;

public class ExamExecutionDto {
    private Long id;
    private String name;
    private String description;
    private Integer durationMinutes;
    private Integer totalMarks;
    private List<QuestionExecutionDto> questions;

    public ExamExecutionDto(Long id, String name, String description, Integer durationMinutes, Integer totalMarks, List<QuestionExecutionDto> questions) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.totalMarks = totalMarks;
        this.questions = questions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public List<QuestionExecutionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionExecutionDto> questions) { this.questions = questions; }
}
