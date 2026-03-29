package com.example.exam.service;

import com.example.exam.model.Option;
import com.example.exam.model.Question;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionExcelService {

    @Autowired
    private QuestionService questionService;

    public void processExcelFile(Long examId, MultipartFile file) throws Exception {
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            // Skip header (assuming row 0 is header: question, optionA, optionB, optionC, optionD, CorrectAnswer)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Cell questionCell = row.getCell(0);
                if (questionCell == null || getCellValueAsString(questionCell).trim().isEmpty()) {
                    continue; // Skip empty rows
                }

                String questionText = getCellValueAsString(questionCell);
                String optA = getCellValueAsString(row.getCell(1));
                String optB = getCellValueAsString(row.getCell(2));
                String optC = getCellValueAsString(row.getCell(3));
                String optD = getCellValueAsString(row.getCell(4));
                String correctAnswersStr = getCellValueAsString(row.getCell(5));

                // Process correct answers (e.g., "[A,B]" -> ["A", "B"])
                List<String> correctOptions = parseCorrectAnswers(correctAnswersStr);

                Question question = new Question();
                question.setExamId(examId);
                question.setQuestionText(questionText);
                question.setMarks(1); // Default marks, can be enhanced to come from excel

                List<Option> options = new ArrayList<>();
                options.add(createOption("A", optA, correctOptions.contains("A")));
                options.add(createOption("B", optB, correctOptions.contains("B")));
                options.add(createOption("C", optC, correctOptions.contains("C")));
                options.add(createOption("D", optD, correctOptions.contains("D")));

                questionService.saveQuestionWithOptions(question, options);
            }
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf(cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }

    private List<String> parseCorrectAnswers(String correctAnswersStr) {
        if (correctAnswersStr == null || correctAnswersStr.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // Remove brackets if present
        String cleaned = correctAnswersStr.replace("[", "").replace("]", "").toUpperCase();
        
        // Split by comma
        return Arrays.stream(cleaned.split(","))
                .map(String::trim)
                .collect(Collectors.toList());
    }

    private Option createOption(String letter, String text, boolean isCorrect) {
        Option option = new Option();
        option.setOptionText(text);
        option.setIsCorrect(isCorrect);
        return option;
    }
}
