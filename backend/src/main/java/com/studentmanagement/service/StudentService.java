package com.studentmanagement.service;

import com.studentmanagement.dto.response.StudentProfileResponse;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.exception.ResourceNotFoundException;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;

    public StudentService(StudentProfileRepository studentProfileRepository) {
        this.studentProfileRepository = studentProfileRepository;
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getMyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        StudentProfile profile = studentProfileRepository.findByUserIdWithUser(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));

        Long rank = studentProfileRepository.findRankByStudentId(profile.getId()).orElse(null);
        return mapToResponse(profile, rank);
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfileById(Long studentId) {
        StudentProfile profile = studentProfileRepository.findByIdWithUser(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        Long rank = studentProfileRepository.findRankByStudentId(profile.getId()).orElse(null);
        return mapToResponse(profile, rank);
    }

    @Transactional(readOnly = true)
    public Page<StudentProfileResponse> getAllStudents(Pageable pageable) {
        return studentProfileRepository.findAll(pageable)
                .map(profile -> {
                    Long rank = studentProfileRepository.findRankByStudentId(profile.getId()).orElse(null);
                    return mapToResponse(profile, rank);
                });
    }

    private StudentProfileResponse mapToResponse(StudentProfile profile, Long rank) {
        return new StudentProfileResponse(
            profile.getId(),
            profile.getUser().getId(),
            profile.getUser().getName(),
            profile.getUser().getEmail(),
            profile.getRollNumber(),
            profile.getDepartment(),
            profile.getSemester(),
            profile.getTotalPoints(),
            rank
        );
    }
}

