package com.studentmanagement.service;

import com.studentmanagement.dto.response.LeaderboardPageResponse;
import com.studentmanagement.dto.response.LeaderboardProjection;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.entity.User;
import com.studentmanagement.enums.Role;
import com.studentmanagement.exception.BadRequestException;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.security.CustomUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @InjectMocks
    private LeaderboardService leaderboardService;

    private User studentUser;

    @BeforeEach
    void setUp() {
        studentUser = new User(2L, "Rahul", "rahul@student.edu", "pass", Role.STUDENT, true);
        CustomUserDetails userDetails = new CustomUserDetails(studentUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private LeaderboardProjection createMockProjection(Long studentId, Long userId, String name, String roll,
                                                       String dept, Integer sem, Integer points, Long rank) {
        return new LeaderboardProjection() {
            @Override public Long getStudentId() { return studentId; }
            @Override public Long getUserId() { return userId; }
            @Override public String getName() { return name; }
            @Override public String getRollNumber() { return roll; }
            @Override public String getDepartment() { return dept; }
            @Override public Integer getSemester() { return sem; }
            @Override public Integer getTotalPoints() { return points; }
            @Override public Long getRank() { return rank; }
        };
    }

    @Test
    @DisplayName("Leaderboard competition ranking returns tied ranks and skips next")
    void testLeaderboardCompetitionRanking() {
        // Scenario: Rahul 950 (Rank 1), Priya 900 (Rank 2), Amit 900 (Rank 2), Sneha 850 (Rank 4)
        List<LeaderboardProjection> list = List.of(
            createMockProjection(1L, 2L, "Rahul", "CS-001", "CS", 6, 950, 1L),
            createMockProjection(2L, 3L, "Priya", "CS-002", "CS", 6, 900, 2L),
            createMockProjection(3L, 4L, "Amit", "EC-015", "EC", 6, 900, 2L),
            createMockProjection(4L, 5L, "Sneha", "ME-042", "ME", 6, 850, 4L)
        );
        Page<LeaderboardProjection> page = new PageImpl<>(list);

        when(studentProfileRepository.findLeaderboardPaged(any(Pageable.class))).thenReturn(page);
        StudentProfile studentProfile = new StudentProfile(1L, studentUser, "CS-001", "CS", 6, 950);
        when(studentProfileRepository.findByUserId(2L)).thenReturn(Optional.of(studentProfile));
        when(studentProfileRepository.findRankByStudentId(1L)).thenReturn(Optional.of(1L));

        LeaderboardPageResponse response = leaderboardService.getLeaderboard(0, 10, "totalPoints,desc");

        assertNotNull(response);
        assertEquals(4, response.getContent().size());
        assertEquals(1L, response.getContent().get(0).getRank());
        assertEquals(2L, response.getContent().get(1).getRank());
        assertEquals(2L, response.getContent().get(2).getRank()); // Tied
        assertEquals(4L, response.getContent().get(3).getRank()); // Skipped 3 -> 4
        assertEquals(1L, response.getCurrentStudentRank());
    }

    @Test
    @DisplayName("Sort validation rejects disallowed fields")
    void testDisallowedSortField() {
        assertThrows(BadRequestException.class, () -> leaderboardService.getLeaderboard(0, 10, "password,desc"));
    }

    @Test
    @DisplayName("Invalid sort direction is rejected")
    void testInvalidSortDirection() {
        assertThrows(BadRequestException.class, () -> leaderboardService.getLeaderboard(0, 10, "totalPoints,invalid"));
    }
}

