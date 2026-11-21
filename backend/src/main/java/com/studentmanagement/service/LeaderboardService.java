package com.studentmanagement.service;

import com.studentmanagement.dto.response.LeaderboardEntryResponse;
import com.studentmanagement.dto.response.LeaderboardPageResponse;
import com.studentmanagement.dto.response.LeaderboardProjection;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.enums.Role;
import com.studentmanagement.exception.BadRequestException;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.security.CustomUserDetails;
import com.studentmanagement.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("totalpoints", "id", "name", "rollnumber");

    private final StudentProfileRepository studentProfileRepository;

    public LeaderboardService(StudentProfileRepository studentProfileRepository) {
        this.studentProfileRepository = studentProfileRepository;
    }

    @Transactional(readOnly = true)
    public LeaderboardPageResponse getLeaderboard(int page, int size, String sortParam) {
        if (page < 0) {
            throw new BadRequestException("Page index must not be less than zero");
        }
        if (size <= 0) {
            throw new BadRequestException("Page size must be greater than zero");
        }
        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }

        // Validate sort parameter if supplied
        if (sortParam != null && !sortParam.trim().isEmpty()) {
            String[] parts = sortParam.split(",");
            String field = parts[0].trim().toLowerCase();
            if (!ALLOWED_SORT_FIELDS.contains(field)) {
                throw new BadRequestException("Sorting by '" + parts[0] + "' is not supported. Allowed fields: " + ALLOWED_SORT_FIELDS);
            }
            if (parts.length > 1) {
                String direction = parts[1].trim().toUpperCase();
                if (!direction.equals("ASC") && !direction.equals("DESC")) {
                    throw new BadRequestException("Invalid sort direction '" + parts[1] + "'. Must be ASC or DESC");
                }
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<LeaderboardProjection> projectionPage = studentProfileRepository.findLeaderboardPaged(pageable);

        List<LeaderboardEntryResponse> content = projectionPage.getContent().stream()
                .map(LeaderboardEntryResponse::fromProjection)
                .collect(Collectors.toList());

        Long currentStudentRank = null;
        try {
            CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
            if (currentUser.getRole() == Role.STUDENT) {
                StudentProfile studentProfile = studentProfileRepository.findByUserId(currentUser.getId()).orElse(null);
                if (studentProfile != null) {
                    currentStudentRank = studentProfileRepository.findRankByStudentId(studentProfile.getId()).orElse(null);
                }
            }
        } catch (Exception ignored) {
            // Unauthenticated or non-student
        }

        return new LeaderboardPageResponse(
            content,
            projectionPage.getNumber(),
            projectionPage.getSize(),
            projectionPage.getTotalElements(),
            projectionPage.getTotalPages(),
            projectionPage.isLast(),
            currentStudentRank
        );
    }

    @Transactional(readOnly = true)
    public Long getMyRank() {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        if (currentUser.getRole() != Role.STUDENT) {
            throw new BadRequestException("Only students have a leaderboard rank");
        }

        StudentProfile studentProfile = studentProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Student profile not found for current user"));

        return studentProfileRepository.findRankByStudentId(studentProfile.getId()).orElse(null);
    }
}

