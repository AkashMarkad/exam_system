package com.example.exam.service;

import com.example.exam.model.Option;
import com.example.exam.model.Question;
import com.example.exam.repository.OptionRepository;
import com.example.exam.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Transactional
    public void saveQuestionWithOptions(Question question, List<Option> options) {
        Question savedQuestion = questionRepository.save(question);
        
        if (options != null) {
            for (Option option : options) {
                option.setQuestion(savedQuestion);
                optionRepository.save(option);
            }
        }
    }
}
