package com.studentmanagement.service;

import com.studentmanagement.dto.request.LoginRequest;
import com.studentmanagement.dto.request.RefreshTokenRequest;
import com.studentmanagement.dto.request.RegisterRequest;
import com.studentmanagement.dto.response.AuthResponse;
import com.studentmanagement.dto.response.StudentProfileResponse;
import com.studentmanagement.dto.response.UserResponse;
import com.studentmanagement.entity.RefreshToken;
import com.studentmanagement.entity.StudentProfile;
import com.studentmanagement.entity.User;
import com.studentmanagement.enums.Role;
import com.studentmanagement.exception.BadRequestException;
import com.studentmanagement.exception.DuplicateResourceException;
import com.studentmanagement.exception.ResourceNotFoundException;
import com.studentmanagement.exception.UnauthorizedException;
import com.studentmanagement.repository.RefreshTokenRepository;
import com.studentmanagement.repository.StudentProfileRepository;
import com.studentmanagement.repository.UserRepository;
import com.studentmanagement.security.CustomUserDetails;
import com.studentmanagement.security.JwtTokenProvider;
import com.studentmanagement.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${app.security.teacher-invite-code:TEACHER_SECURE_KEY_2026}")
    private String teacherInviteCode;

    public AuthService(UserRepository userRepository,
                       StudentProfileRepository studentProfileRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already registered: " + email);
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;

        if (role == Role.TEACHER) {
            if (request.getTeacherInviteCode() == null || !request.getTeacherInviteCode().equals(teacherInviteCode)) {
                throw new BadRequestException("Invalid or missing teacher invite code. Public registration cannot create teacher accounts.");
            }
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setEnabled(true);
        user = userRepository.save(user);

        StudentProfileResponse profileResponse = null;
        if (role == Role.STUDENT) {
            if (request.getRollNumber() == null || request.getRollNumber().trim().isEmpty()) {
                throw new BadRequestException("Roll number is required for student registration");
            }
            if (request.getDepartment() == null || request.getDepartment().trim().isEmpty()) {
                throw new BadRequestException("Department is required for student registration");
            }
            if (request.getSemester() == null || request.getSemester() < 1) {
                throw new BadRequestException("Valid semester is required for student registration");
            }

            String rollNumber = request.getRollNumber().trim().toUpperCase();
            if (studentProfileRepository.existsByRollNumber(rollNumber)) {
                throw new DuplicateResourceException("Roll number already exists: " + rollNumber);
            }

            StudentProfile profile = new StudentProfile();
            profile.setUser(user);
            profile.setRollNumber(rollNumber);
            profile.setDepartment(request.getDepartment().trim());
            profile.setSemester(request.getSemester());
            profile.setTotalPoints(0);
            profile = studentProfileRepository.save(profile);

            Long rank = studentProfileRepository.findRankByStudentId(profile.getId()).orElse(null);
            profileResponse = new StudentProfileResponse(
                profile.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                profile.getRollNumber(),
                profile.getDepartment(),
                profile.getSemester(),
                profile.getTotalPoints(),
                rank
            );
        }

        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = createAndPersistRefreshToken(user);

        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
        return new AuthResponse(accessToken, refreshToken, userResponse, profileResponse);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        StudentProfileResponse profileResponse = null;
        if (user.getRole() == Role.STUDENT) {
            StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElse(null);
            if (profile != null) {
                Long rank = studentProfileRepository.findRankByStudentId(profile.getId()).orElse(null);
                profileResponse = new StudentProfileResponse(
                    profile.getId(),
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    profile.getRollNumber(),
                    profile.getDepartment(),
                    profile.getSemester(),
                    profile.getTotalPoints(),
                    rank
                );
            }
        }

        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = createAndPersistRefreshToken(user);

        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
        return new AuthResponse(accessToken, refreshToken, userResponse, profileResponse);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(request.getRefreshToken())
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (storedToken.isRevoked() || storedToken.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token is expired or revoked");
        }

        User user = storedToken.getUser();
        String newAccessToken = tokenProvider.generateAccessToken(user);

        StudentProfileResponse profileResponse = null;
        if (user.getRole() == Role.STUDENT) {
            StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);
            if (profile != null) {
                Long rank = studentProfileRepository.findRankByStudentId(profile.getId()).orElse(null);
                profileResponse = new StudentProfileResponse(
                    profile.getId(),
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    profile.getRollNumber(),
                    profile.getDepartment(),
                    profile.getSemester(),
                    profile.getTotalPoints(),
                    rank
                );
            }
        }

        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
        return new AuthResponse(newAccessToken, storedToken.getTokenHash(), userResponse, profileResponse);
    }

    @Transactional
    public void logout() {
        Long userId = SecurityUtils.getCurrentUserId();
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public AuthResponse getMe() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        StudentProfileResponse profileResponse = null;
        if (user.getRole() == Role.STUDENT) {
            StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);
            if (profile != null) {
                Long rank = studentProfileRepository.findRankByStudentId(profile.getId()).orElse(null);
                profileResponse = new StudentProfileResponse(
                    profile.getId(),
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    profile.getRollNumber(),
                    profile.getDepartment(),
                    profile.getSemester(),
                    profile.getTotalPoints(),
                    rank
                );
            }
        }

        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
        return new AuthResponse(null, null, userResponse, profileResponse);
    }

    private String createAndPersistRefreshToken(User user) {
        refreshTokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        Instant expiresAt = Instant.now().plusMillis(tokenProvider.getJwtRefreshExpirationMs());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(token);
        refreshToken.setExpiresAt(expiresAt);
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);
        return token;
    }
}

