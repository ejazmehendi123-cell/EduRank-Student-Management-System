package com.studentmanagement.service;

import com.studentmanagement.dto.request.LoginRequest;
import com.studentmanagement.dto.request.RegisterRequest;
import com.studentmanagement.dto.response.AuthResponse;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.entity.User;
import com.studentmanagement.enums.Role;
import com.studentmanagement.exception.BadRequestException;
import com.studentmanagement.exception.DuplicateResourceException;
import com.studentmanagement.repository.RefreshTokenRepository;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.repository.UserRepository;
import com.studentmanagement.security.CustomUserDetails;
import com.studentmanagement.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "teacherInviteCode", "TEACHER_SECURE_KEY_2026");
    }

    @Test
    @DisplayName("Registration success - student profile created")
    void testRegisterStudentSuccess() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Test Student");
        req.setEmail("test@student.edu");
        req.setPassword("Password@123");
        req.setRole(Role.STUDENT);
        req.setRollNumber("TEST-001");
        req.setDepartment("Computer Science");
        req.setSemester(5);

        when(userRepository.existsByEmail("test@student.edu")).thenReturn(false);
        when(studentProfileRepository.existsByRollNumber("TEST-001")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encodedPassword");

        User savedUser = new User(10L, "Test Student", "test@student.edu", "encodedPassword", Role.STUDENT, true);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        StudentProfile savedProfile = new StudentProfile(20L, savedUser, "TEST-001", "Computer Science", 5, 0);
        when(studentProfileRepository.save(any(StudentProfile.class))).thenReturn(savedProfile);
        when(studentProfileRepository.findRankByStudentId(20L)).thenReturn(Optional.of(1L));

        when(tokenProvider.generateAccessToken(savedUser)).thenReturn("mockAccessToken");
        when(tokenProvider.getJwtRefreshExpirationMs()).thenReturn(604800000L);

        AuthResponse response = authService.register(req);

        assertNotNull(response);
        assertEquals("mockAccessToken", response.getAccessToken());
        assertEquals("test@student.edu", response.getUser().getEmail());
        assertEquals(Role.STUDENT, response.getUser().getRole());
        assertNotNull(response.getProfile());
        assertEquals("TEST-001", response.getProfile().getRollNumber());
        assertEquals(1L, response.getProfile().getRank());
        verify(userRepository).save(any(User.class));
        verify(studentProfileRepository).save(any(StudentProfile.class));
    }

    @Test
    @DisplayName("Registration rejected - duplicate email")
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Duplicate User");
        req.setEmail("duplicate@school.edu");
        req.setPassword("Password@123");

        when(userRepository.existsByEmail("duplicate@school.edu")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Teacher registration rejected - invalid invite code")
    void testTeacherRegistrationInvalidInviteCode() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Fake Teacher");
        req.setEmail("faketeacher@school.edu");
        req.setPassword("Password@123");
        req.setRole(Role.TEACHER);
        req.setTeacherInviteCode("WRONG_CODE");

        when(userRepository.existsByEmail("faketeacher@school.edu")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login success - returns access token and profile")
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest("test@student.edu", "Password@123");
        User user = new User(10L, "Test Student", "test@student.edu", "encodedPassword", Role.STUDENT, true);
        CustomUserDetails userDetails = new CustomUserDetails(user);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        StudentProfile profile = new StudentProfile(20L, user, "TEST-001", "Computer Science", 5, 100);
        when(studentProfileRepository.findByUserId(10L)).thenReturn(Optional.of(profile));
        when(studentProfileRepository.findRankByStudentId(20L)).thenReturn(Optional.of(3L));
        when(tokenProvider.generateAccessToken(user)).thenReturn("validJwtToken");
        when(tokenProvider.getJwtRefreshExpirationMs()).thenReturn(604800000L);

        AuthResponse response = authService.login(req);

        assertNotNull(response);
        assertEquals("validJwtToken", response.getAccessToken());
        assertEquals("test@student.edu", response.getUser().getEmail());
        assertEquals(3L, response.getProfile().getRank());
        assertEquals(100, response.getProfile().getTotalPoints());
    }

    @Test
    @DisplayName("Login failure - bad credentials throws exception")
    void testLoginBadCredentials() {
        LoginRequest req = new LoginRequest("test@student.edu", "WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid email or password"));

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }
}

