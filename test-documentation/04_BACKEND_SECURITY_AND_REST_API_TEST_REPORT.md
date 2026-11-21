# Test Condition Report: 04 — Backend Security & REST API Integration

## 1. Overview and Scope

This document details the test conditions, security filters, controller exception handling, HTTP status codes, and MockMvc integration test results for the **Backend Security and REST API Subsystem**.

- **Backend Target**: [`SecurityConfig.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/security/SecurityConfig.java), [`JwtAuthenticationFilter.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/security/JwtAuthenticationFilter.java), [`GlobalExceptionHandler.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/exception/GlobalExceptionHandler.java), [`ErrorResponse.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/dto/ErrorResponse.java)
- **Test Class**: [`SecurityAndAuthorizationIntegrationTest.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/test/java/com/studentmanagement/SecurityAndAuthorizationIntegrationTest.java)
- **Harness**: Spring Boot Test with `@SpringBootTest`, `@AutoConfigureMockMvc`, and MockMvc request dispatchers.

---

## 2. Standardized API Response & Error Contract

All REST endpoints conform to standardized JSON contracts. When exceptions occur, [`GlobalExceptionHandler`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/exception/GlobalExceptionHandler.java) formats errors identically:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Student cannot have negative points. Current points: 100",
  "path": "/api/v1/points/adjust",
  "timestamp": "2026-11-21T12:44:17.348Z"
}
```

### Handled Exceptions & Mapped Status Codes:
- `BadCredentialsException` $\rightarrow$ **401 Unauthorized**
- `AccessDeniedException` $\rightarrow$ **403 Forbidden**
- `ResourceNotFoundException` $\rightarrow$ **404 Not Found**
- `BadRequestException` $\rightarrow$ **400 Bad Request**
- `MethodArgumentNotValidException` $\rightarrow$ **400 Bad Request** (with field-level validation errors)
- `Exception` (catch-all) $\rightarrow$ **500 Internal Server Error**

---

## 3. MockMvc Test Cases & Execution Results

### TC-MOCK-01: Anonymous Access to Protected Resource (401)
- **Test Objective**: Verify that any unauthenticated HTTP request to an authenticated route is rejected immediately by the Spring Security filter chain with HTTP 401 Unauthorized.
- **Test Method**: `SecurityAndAuthorizationIntegrationTest.testUnauthenticatedReturns401()`
- **HTTP Dispatch**:
  ```http
  GET /api/v1/students HTTP/1.1
  Host: localhost:8081
  ```
- **Assertions**:
  - `status().isUnauthorized()`
- **Actual Result**: **PASSED** (Status: `401`, Execution Time: `0.031 s`)

---

### TC-MOCK-02: Role Segregation — Student Forbidden on Teacher Endpoints (403)
- **Test Objective**: Verify that an authenticated user possessing only `ROLE_STUDENT` cannot access teacher administration endpoints.
- **Test Method**: `SecurityAndAuthorizationIntegrationTest.testStudentForbiddenOnTeacherEndpoint()`
- **Security Context**: `@WithMockUser(username = "student@sms.edu", roles = {"STUDENT"})`
- **HTTP Dispatch**:
  ```http
  GET /api/v1/students HTTP/1.1
  Host: localhost:8081
  ```
- **Assertions**:
  - `status().isForbidden()`
- **Actual Result**: **PASSED** (Status: `403`, Execution Time: `0.009 s`)

---

### TC-MOCK-03: Role Segregation — Student Forbidden on Points Awarding (403)
- **Test Objective**: Verify that a student cannot spoof or invoke the point awarding endpoint.
- **Test Method**: `SecurityAndAuthorizationIntegrationTest.testStudentForbiddenOnAwardPoints()`
- **Security Context**: `@WithMockUser(username = "student@sms.edu", roles = {"STUDENT"})`
- **HTTP Dispatch**:
  ```http
  POST /api/v1/points/award HTTP/1.1
  Host: localhost:8081
  Content-Type: application/json

  {
    "studentId": 1,
    "points": 100,
    "reason": "Self-awarding cheat"
  }
  ```
- **Assertions**:
  - `status().isForbidden()`
- **Actual Result**: **PASSED** (Status: `403`, Execution Time: `0.750 s`)

---

### TC-MOCK-04: Authorized Access for Teacher Role (200)
- **Test Objective**: Verify that users with `ROLE_TEACHER` can successfully access teacher resources.
- **Test Method**: `SecurityAndAuthorizationIntegrationTest.testTeacherAuthorizedOnTeacherDashboard()`
- **Security Context**: `@WithMockUser(username = "teacher@sms.edu", roles = {"TEACHER"})`
- **HTTP Dispatch**:
  ```http
  GET /api/v1/students HTTP/1.1
  Host: localhost:8081
  ```
- **Assertions**:
  - `status().isOk()`
- **Actual Result**: **PASSED** (Status: `200`, Execution Time: `0.055 s`)

---

### TC-MOCK-05: Public Endpoint Accessibility
- **Test Objective**: Verify that authentication endpoints `/api/v1/auth/login` and `/api/v1/auth/register` are publicly accessible without authentication tokens.
- **Test Method**: `SecurityAndAuthorizationIntegrationTest.testPublicEndpointsAccessible()`
- **HTTP Dispatch**:
  ```http
  POST /api/v1/auth/login HTTP/1.1
  Host: localhost:8081
  Content-Type: application/json

  {}
  ```
- **Assertions**:
  - `status().isBadRequest()` (Fails due to body validation `@Valid`, proving the request passed through Spring Security and reached the controller).
- **Actual Result**: **PASSED** (Status: `400`, Execution Time: `0.030 s`)

---

## 4. API Endpoint Contract Matrix

| Endpoint URI | Method | Permitted Roles | Expected Status Codes | Request / Query Parameters |
| :--- | :---: | :---: | :---: | :--- |
| `/api/v1/auth/register` | `POST` | Public | `201`, `400` | `RegisterRequest` (body) |
| `/api/v1/auth/login` | `POST` | Public | `200`, `401` | `LoginRequest` (body) |
| `/api/v1/auth/refresh` | `POST` | Public | `200`, `401` | `RefreshTokenRequest` (body) |
| `/api/v1/auth/logout` | `POST` | Authenticated | `200`, `401` | Header `Authorization: Bearer <token>` |
| `/api/v1/leaderboard` | `GET` | Authenticated | `200`, `400`, `401` | `page`, `size`, `sortBy`, `direction` |
| `/api/v1/leaderboard/rank/me` | `GET` | `ROLE_STUDENT` | `200`, `401`, `403` | Header `Authorization: Bearer <token>` |
| `/api/v1/students` | `GET` | `ROLE_TEACHER` | `200`, `401`, `403` | `page`, `size`, `search` |
| `/api/v1/students/{id}` | `GET` | Authenticated | `200`, `401`, `404` | Path variable `id` |
| `/api/v1/points/award` | `POST` | `ROLE_TEACHER` | `201`, `400`, `401`, `403` | `AwardPointsRequest` (body) |
| `/api/v1/points/adjust` | `POST` | `ROLE_TEACHER` | `200`, `400`, `401`, `403` | `AdjustPointsRequest` (body) |
| `/api/v1/points/history/{studentId}` | `GET` | Authenticated | `200`, `401`, `404` | `studentId`, `page`, `size` |

---

## 5. Summary & Verification Conclusion

All **5 MockMvc integration test conditions** passed without failure. Route protection accurately blocks unauthenticated users with 401, enforces role-based barriers with 403, and allows public and authorized operations with 200/201.

