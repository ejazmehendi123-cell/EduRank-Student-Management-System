package com.studentmanagement.controller;

import com.studentmanagement.dto.response.StudentProfileResponse;
import com.studentmanagement.dto.response.TeacherDashboardResponse;
import com.studentmanagement.service.StudentService;
import com.studentmanagement.service.TeacherService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/teacher")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    private final TeacherService teacherService;
    private final StudentService studentService;

    public TeacherController(TeacherService teacherService, StudentService studentService) {
        this.teacherService = teacherService;
        this.studentService = studentService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<TeacherDashboardResponse> getDashboard() {
        return ResponseEntity.ok(teacherService.getTeacherDashboard());
    }

    @GetMapping("/students")
    public ResponseEntity<Page<StudentProfileResponse>> getStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(direction, sortParts[0]));
        return ResponseEntity.ok(studentService.getAllStudents(pageable));
    }
}

