package com.example.exam.controller;

import com.example.exam.service.AttemptService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private static final Logger logger = LoggerFactory.getLogger(LeaderboardController.class);
    private final AttemptService attemptService;

    public LeaderboardController(AttemptService attemptService) {
        this.attemptService = attemptService;
    }

    /**
     * GET /api/leaderboard
     * Returns the overall leaderboard across all exams, ranked by score descending.
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {
        logger.info("Fetching overall leaderboard");
        return ResponseEntity.ok(attemptService.getLeaderboard());
    }

    /**
     * GET /api/leaderboard/{examId}
     * Returns the leaderboard for a specific exam, ranked by score descending.
     */
    @GetMapping("/{examId}")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboardByExam(
            @PathVariable("examId") Long examId) {
        logger.info("Fetching leaderboard for exam {}", examId);
        return ResponseEntity.ok(attemptService.getLeaderboardByExam(examId));
    }
}
