package com.studentmanagement.controller;

import com.studentmanagement.dto.response.LeaderboardPageResponse;
import com.studentmanagement.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<LeaderboardPageResponse> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sort) {
        LeaderboardPageResponse response = leaderboardService.getLeaderboard(page, size, sort);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyRank() {
        Long rank = leaderboardService.getMyRank();
        return ResponseEntity.ok(Map.of("rank", rank != null ? rank : "Unranked"));
    }
}

