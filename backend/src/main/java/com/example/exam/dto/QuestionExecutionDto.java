package com.example.exam.dto;

import java.util.List;

public class QuestionExecutionDto {
    private Long id;
    private String questionText;
    private Integer marks;
    private List<OptionExecutionDto> options;

    public QuestionExecutionDto(Long id, String questionText, Integer marks, List<OptionExecutionDto> options) {
        this.id = id;
        this.questionText = questionText;
        this.marks = marks;
        this.options = options;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public Integer getMarks() { return marks; }
    public void setMarks(Integer marks) { this.marks = marks; }
    public List<OptionExecutionDto> getOptions() { return options; }
    public void setOptions(List<OptionExecutionDto> options) { this.options = options; }
}
