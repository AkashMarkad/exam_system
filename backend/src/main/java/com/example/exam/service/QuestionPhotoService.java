package com.example.exam.service;

import com.example.exam.model.Exam;
import com.example.exam.model.Option;
import com.example.exam.model.Question;
import com.example.exam.repository.ExamRepository;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class QuestionPhotoService {

    @Autowired
    private QuestionService questionService;

    @Autowired
    private ExamRepository examRepository;

    public void processPhotoFile(Long examId, MultipartFile file) throws Exception {
        
        // Save multipart file to temporary file for Tess4J
        File tempFile = File.createTempFile("ocr_", file.getOriginalFilename());
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(file.getBytes());
        }

        try {
            Tesseract tesseract = new Tesseract();
            // User must have tesseract installed, we assume standard paths or default env setup.
            // tesseract.setDatapath("path/to/tessdata"); // if needed
            tesseract.setLanguage("eng");

            String extractedText = tesseract.doOCR(tempFile);
            
            // Simple parsing logic: Assumes format like
            // Q1. What is java?
            // A. Language
            // B. Coffee
            // C. Both
            // D. None
            // Correct: C (or similar, or we might not have correct answers from photo)
            
            parseAndSaveText(examId, extractedText);

        } catch (TesseractException e) {
            throw new Exception("Failed to process image with OCR", e);
        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    private void parseAndSaveText(Long examId, String text) {
        Exam exam = examRepository.findById(examId).orElse(null);
        if (exam == null) return;
        // This is a naive implementation and will need robust Regex or LLM parsing for real-world scenarios.
        // We split by lines looking for Question patterns.
        String[] lines = text.split("\\r?\\n");
        
        Question currentQuestion = null;
        List<Option> currentOptions = new ArrayList<>();
        
        // Patterns
        Pattern qPattern = Pattern.compile("^(?:Q?\\d+\\.|Question:?)\\s+(.+)");
        Pattern optPattern = Pattern.compile("^([A-D])\\.\\s+(.+)");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            Matcher qMatcher = qPattern.matcher(line);
            if (qMatcher.matches()) {
                // Save previous if exists
                if (currentQuestion != null && !currentOptions.isEmpty()) {
                    questionService.saveQuestionWithOptions(currentQuestion, currentOptions);
                }

                currentQuestion = new Question();
                currentQuestion.setExam(exam);
                currentQuestion.setQuestionText(qMatcher.group(1));
                currentQuestion.setMarks(1);
                currentOptions = new ArrayList<>();
                continue;
            }

            Matcher optMatcher = optPattern.matcher(line);
            if (optMatcher.matches() && currentQuestion != null) {
                Option option = new Option();
                option.setOptionText(optMatcher.group(2));
                
                // Without manual review or explicit tags, we don't know the correct answer from photo.
                // Setting to false; instructor would need to review in UI.
                option.setIsCorrect(false); 
                currentOptions.add(option);
            }
        }

        // Save last question
        if (currentQuestion != null && !currentOptions.isEmpty()) {
            questionService.saveQuestionWithOptions(currentQuestion, currentOptions);
        }
    }
}
