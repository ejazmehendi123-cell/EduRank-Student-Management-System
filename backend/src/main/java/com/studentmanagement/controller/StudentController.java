package com.studentmanagement.controller;

import com.studentmanagement.dto.response.PointTransactionResponse;
import com.studentmanagement.dto.response.StudentProfileResponse;
import com.studentmanagement.service.PointsService;
import com.studentmanagement.service.StudentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;
    private final PointsService pointsService;

    public StudentController(StudentService studentService, PointsService pointsService) {
        this.studentService = studentService;
        this.pointsService = pointsService;
    }

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Page<StudentProfileResponse>> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(direction, sortParts[0]));
        return ResponseEntity.ok(studentService.getAllStudents(pageable));
    }

    @GetMapping("/me")
    public ResponseEntity<StudentProfileResponse> getMyProfile() {
        return ResponseEntity.ok(studentService.getMyProfile());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentProfileResponse> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getProfileById(id));
    }

    @GetMapping("/{id}/points-history")
    public ResponseEntity<List<PointTransactionResponse>> getPointsHistory(@PathVariable Long id) {
        return ResponseEntity.ok(pointsService.getHistoryByStudentId(id));
    }

    @GetMapping("/me/points-history")
    public ResponseEntity<List<PointTransactionResponse>> getMyPointsHistory() {
        return ResponseEntity.ok(pointsService.getMyHistory());
    }
}

