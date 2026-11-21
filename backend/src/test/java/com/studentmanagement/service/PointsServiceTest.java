package com.studentmanagement.service;

import com.studentmanagement.dto.request.AdjustPointsRequest;
import com.studentmanagement.dto.request.AwardPointsRequest;
import com.studentmanagement.dto.response.PointTransactionResponse;
import com.studentmanagement.entity.PointTransaction;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.entity.User;
import com.studentmanagement.enums.Role;
import com.studentmanagement.enums.TransactionType;
import com.studentmanagement.exception.BadRequestException;
import com.studentmanagement.repository.PointTransactionRepository;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.repository.UserRepository;
import com.studentmanagement.security.CustomUserDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PointsServiceTest {

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private PointTransactionRepository pointTransactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PointsService pointsService;

    private User teacherUser;
    private StudentProfile studentProfile;

    @BeforeEach
    void setUp() {
        teacherUser = new User(1L, "Prof. Sharma", "teacher@school.edu", "pass", Role.TEACHER, true);
        CustomUserDetails userDetails = new CustomUserDetails(teacherUser);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
        );

        User studentUser = new User(2L, "Rahul Verma", "rahul@student.edu", "pass", Role.STUDENT, true);
        studentProfile = new StudentProfile(10L, studentUser, "CS-001", "CS", 6, 100);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Award points successfully increments total points and persists transaction")
    void testAwardPointsSuccess() {
        AwardPointsRequest req = new AwardPointsRequest(10L, 50, "Great Project", "idemp-001");

        when(pointTransactionRepository.findByIdempotencyKey("idemp-001")).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(teacherUser));
        when(studentProfileRepository.findByIdWithUser(10L)).thenReturn(Optional.of(studentProfile));
        when(pointTransactionRepository.save(any(PointTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PointTransactionResponse response = pointsService.awardPoints(req);

        assertNotNull(response);
        assertEquals(50, response.getPoints());
        assertEquals("Great Project", response.getReason());
        assertEquals(TransactionType.AWARD, response.getTransactionType());
        assertEquals(150, studentProfile.getTotalPoints());

        verify(studentProfileRepository).save(studentProfile);
        verify(pointTransactionRepository).save(any(PointTransaction.class));
    }

    @Test
    @DisplayName("Award points rejects zero or negative points")
    void testAwardPointsZeroOrNegative() {
        AwardPointsRequest reqZero = new AwardPointsRequest(10L, 0, "No points", null);
        assertThrows(BadRequestException.class, () -> pointsService.awardPoints(reqZero));

        AwardPointsRequest reqNeg = new AwardPointsRequest(10L, -20, "Negative points", null);
        assertThrows(BadRequestException.class, () -> pointsService.awardPoints(reqNeg));
    }

    @Test
    @DisplayName("Adjust points successfully deducts points when sufficient balance exists")
    void testAdjustPointsDeductSuccess() {
        AdjustPointsRequest req = new AdjustPointsRequest(10L, -40, "Late penalty", null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(teacherUser));
        when(studentProfileRepository.findByIdWithUser(10L)).thenReturn(Optional.of(studentProfile));
        when(pointTransactionRepository.save(any(PointTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PointTransactionResponse response = pointsService.adjustPoints(req);

        assertNotNull(response);
        assertEquals(-40, response.getPoints());
        assertEquals(TransactionType.ADJUSTMENT, response.getTransactionType());
        assertEquals(60, studentProfile.getTotalPoints());
    }

    @Test
    @DisplayName("Adjust points rejects deduction if resulting balance would be negative")
    void testAdjustPointsPreventNegativeBalance() {
        AdjustPointsRequest req = new AdjustPointsRequest(10L, -150, "Excess penalty", null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(teacherUser));
        when(studentProfileRepository.findByIdWithUser(10L)).thenReturn(Optional.of(studentProfile));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> pointsService.adjustPoints(req));
        assertTrue(ex.getMessage().contains("Total points cannot be negative"));
        assertEquals(100, studentProfile.getTotalPoints()); // unmodified
        verify(pointTransactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Idempotency key prevents duplicate transaction")
    void testIdempotentTransaction() {
        AwardPointsRequest req = new AwardPointsRequest(10L, 50, "Project", "idemp-dup");
        PointTransaction existing = new PointTransaction(99L, studentProfile, teacherUser, 50, TransactionType.AWARD, "Project", "idemp-dup");

        when(pointTransactionRepository.findByIdempotencyKey("idemp-dup")).thenReturn(Optional.of(existing));

        PointTransactionResponse response = pointsService.awardPoints(req);

        assertNotNull(response);
        assertEquals(99L, response.getId());
        verify(studentProfileRepository, never()).save(any());
        verify(pointTransactionRepository, never()).save(any());
    }
}

