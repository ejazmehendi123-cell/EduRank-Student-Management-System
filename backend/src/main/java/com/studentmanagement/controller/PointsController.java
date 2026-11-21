package com.studentmanagement.controller;

import com.studentmanagement.dto.request.AdjustPointsRequest;
import com.studentmanagement.dto.request.AwardPointsRequest;
import com.studentmanagement.dto.response.PointTransactionResponse;
import com.studentmanagement.service.PointsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/points")
public class PointsController {

    private final PointsService pointsService;

    public PointsController(PointsService pointsService) {
        this.pointsService = pointsService;
    }

    @PostMapping("/award")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<PointTransactionResponse> awardPoints(@Valid @RequestBody AwardPointsRequest request) {
        PointTransactionResponse response = pointsService.awardPoints(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<PointTransactionResponse> adjustPoints(@Valid @RequestBody AdjustPointsRequest request) {
        PointTransactionResponse response = pointsService.adjustPoints(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{studentId}")
    public ResponseEntity<List<PointTransactionResponse>> getPointsHistory(@PathVariable Long studentId) {
        List<PointTransactionResponse> history = pointsService.getHistoryByStudentId(studentId);
        return ResponseEntity.ok(history);
    }
}

