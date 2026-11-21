package com.studentmanagement.service;

import com.studentmanagement.dto.request.AdjustPointsRequest;
import com.studentmanagement.dto.request.AwardPointsRequest;
import com.studentmanagement.dto.response.PointTransactionResponse;
import com.studentmanagement.dto.response.StudentProfileResponse;
import com.studentmanagement.entity.PointTransaction;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.entity.User;
import com.studentmanagement.enums.TransactionType;
import com.studentmanagement.exception.BadRequestException;
import com.studentmanagement.exception.ResourceNotFoundException;
import com.studentmanagement.repository.PointTransactionRepository;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.repository.UserRepository;
import com.studentmanagement.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PointsService {

    private final StudentProfileRepository studentProfileRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final UserRepository userRepository;

    public PointsService(StudentProfileRepository studentProfileRepository,
                         PointTransactionRepository pointTransactionRepository,
                         UserRepository userRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.pointTransactionRepository = pointTransactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PointTransactionResponse awardPoints(AwardPointsRequest request) {
        if (request.getPoints() == null || request.getPoints() <= 0) {
            throw new BadRequestException("Award points must be greater than zero");
        }

        // Check idempotency if key provided
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty()) {
            Optional<PointTransaction> existing = pointTransactionRepository.findByIdempotencyKey(request.getIdempotencyKey().trim());
            if (existing.isPresent()) {
                return PointTransactionResponse.fromEntity(existing.get());
            }
        }

        Long teacherUserId = SecurityUtils.getCurrentUserId();
        User teacher = userRepository.findById(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated teacher record not found"));

        StudentProfile student = studentProfileRepository.findByIdWithUser(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found with ID: " + request.getStudentId()));

        // Atomic update of points
        student.setTotalPoints(student.getTotalPoints() + request.getPoints());
        studentProfileRepository.save(student);

        PointTransaction transaction = new PointTransaction();
        transaction.setStudent(student);
        transaction.setTeacher(teacher);
        transaction.setPoints(request.getPoints());
        transaction.setTransactionType(TransactionType.AWARD);
        transaction.setReason(request.getReason().trim());
        transaction.setIdempotencyKey(request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty() ? request.getIdempotencyKey().trim() : null);

        transaction = pointTransactionRepository.save(transaction);
        return PointTransactionResponse.fromEntity(transaction);
    }

    @Transactional
    public PointTransactionResponse adjustPoints(AdjustPointsRequest request) {
        if (request.getPoints() == null || request.getPoints() == 0) {
            throw new BadRequestException("Adjustment points cannot be zero");
        }

        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty()) {
            Optional<PointTransaction> existing = pointTransactionRepository.findByIdempotencyKey(request.getIdempotencyKey().trim());
            if (existing.isPresent()) {
                return PointTransactionResponse.fromEntity(existing.get());
            }
        }

        Long teacherUserId = SecurityUtils.getCurrentUserId();
        User teacher = userRepository.findById(teacherUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated teacher record not found"));

        StudentProfile student = studentProfileRepository.findByIdWithUser(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found with ID: " + request.getStudentId()));

        int newTotal = student.getTotalPoints() + request.getPoints();
        if (newTotal < 0) {
            throw new BadRequestException("Cannot deduct " + Math.abs(request.getPoints()) +
                    " points. Student only has " + student.getTotalPoints() + " points. Total points cannot be negative.");
        }

        student.setTotalPoints(newTotal);
        studentProfileRepository.save(student);

        PointTransaction transaction = new PointTransaction();
        transaction.setStudent(student);
        transaction.setTeacher(teacher);
        transaction.setPoints(request.getPoints());
        transaction.setTransactionType(TransactionType.ADJUSTMENT);
        transaction.setReason(request.getReason().trim());
        transaction.setIdempotencyKey(request.getIdempotencyKey() != null && !request.getIdempotencyKey().trim().isEmpty() ? request.getIdempotencyKey().trim() : null);

        transaction = pointTransactionRepository.save(transaction);
        return PointTransactionResponse.fromEntity(transaction);
    }

    @Transactional(readOnly = true)
    public List<PointTransactionResponse> getHistoryByStudentId(Long studentId) {
        if (!studentProfileRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student profile not found with ID: " + studentId);
        }

        return pointTransactionRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(PointTransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PointTransactionResponse> getMyHistory() {
        Long userId = SecurityUtils.getCurrentUserId();
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));

        return getHistoryByStudentId(student.getId());
    }
}

