package com.studentmanagement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentmanagement.dto.request.AwardPointsRequest;
import com.studentmanagement.dto.request.LoginRequest;
import com.studentmanagement.dto.request.RegisterRequest;
import com.studentmanagement.entity.User;
import com.studentmanagement.enums.Role;
import com.studentmanagement.repository.UserRepository;
import com.studentmanagement.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAndAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Unauthenticated request to protected endpoint returns 401")
    void testUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/teacher/dashboard"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Student user receives 403 Forbidden when accessing teacher dashboard")
    void testStudentForbiddenOnTeacherEndpoint() throws Exception {
        User student = new User(null, "Test Student", "student_test_sec@school.edu", "pass", Role.STUDENT, true);
        student = userRepository.save(student);

        String token = jwtTokenProvider.generateAccessToken(student);

        mockMvc.perform(get("/api/v1/teacher/dashboard")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Student user receives 403 Forbidden when attempting to award points")
    void testStudentForbiddenOnAwardPoints() throws Exception {
        User student = new User(null, "Test Student 2", "student_test_sec2@school.edu", "pass", Role.STUDENT, true);
        student = userRepository.save(student);

        String token = jwtTokenProvider.generateAccessToken(student);
        AwardPointsRequest req = new AwardPointsRequest(1L, 50, "Cheat points", null);

        mockMvc.perform(post("/api/v1/points/award")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Teacher user receives 200 OK when accessing teacher dashboard")
    void testTeacherAuthorizedOnTeacherDashboard() throws Exception {
        User teacher = new User(null, "Test Teacher", "teacher_test_sec@school.edu", "pass", Role.TEACHER, true);
        teacher = userRepository.save(teacher);

        String token = jwtTokenProvider.generateAccessToken(teacher);

        mockMvc.perform(get("/api/v1/teacher/dashboard")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public endpoints (register and login) allow unauthenticated access")
    void testPublicEndpointsAccessible() throws Exception {
        // Bad request input returns 400 validation error, NOT 401/403
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }
}

