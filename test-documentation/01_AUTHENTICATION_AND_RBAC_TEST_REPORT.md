# Test Condition Report: 01 — Authentication & Role-Based Access Control (RBAC)

## 1. Overview and Scope

This document details the test conditions, input payloads, validation rules, execution logs, and verification results for the **Authentication and Role-Based Access Control (RBAC)** subsystem.

- **Backend Target**: [`AuthController.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/controller/AuthController.java), [`AuthService.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/service/AuthService.java), [`SecurityConfig.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/security/SecurityConfig.java), [`JwtTokenProvider.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/security/JwtTokenProvider.java)
- **Frontend Target**: [`authSlice.js`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/frontend/src/features/auth/authSlice.js), [`authThunks.js`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/frontend/src/features/auth/authThunks.js), [`RootNavigator.js`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/frontend/src/navigation/RootNavigator.js), [`validators.js`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/frontend/src/utils/validators.js)
- **Database Target**: `users`, `student_profiles`, `refresh_tokens`

---

## 2. Test Condition Specifications & Results

### TC-AUTH-01: Successful Student Registration
- **Test Objective**: Verify that a user can register with role `ROLE_STUDENT`, receiving a 201 Created status, a BCrypt-hashed password, and an automatically initialized `StudentProfile` with `0` initial points.
- **Test File / Method**: `AuthServiceTest.java` $\rightarrow$ `testRegisterStudentSuccess()`
- **Input Data**:
  ```json
  {
    "name": "Jane Student",
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "ROLE_STUDENT",
    "department": "Computer Science",
    "rollNumber": "CS099"
  }
  ```
- **Execution Logic**:
  1. Service checks if email `jane@example.com` exists.
  2. Encodes password via BCrypt (10 rounds).
  3. Saves `User` entity to repository.
  4. Automatically instantiates and saves `StudentProfile` linking `user_id`, `roll_number="CS099"`, `department="Computer Science"`, and `total_points=0`.
- **Expected Outcome**:
  - `UserResponse` returned with `name="Jane Student"`, `email="jane@example.com"`, and `role="ROLE_STUDENT"`.
  - Profile saved with `total_points == 0`.
- **Actual Result**: **PASSED** (Execution time: `0.007 s`)

---

### TC-AUTH-02: Rejection of Duplicate Email Registration
- **Test Objective**: Ensure that attempting to register an account with an email that is already registered fails with a `BadRequestException` and HTTP 400 Bad Request.
- **Test File / Method**: `AuthServiceTest.java` $\rightarrow$ `testRegisterDuplicateEmail()`
- **Input Data**:
  ```json
  {
    "name": "Duplicate User",
    "email": "existing@example.com",
    "password": "Password123!",
    "role": "ROLE_STUDENT"
  }
  ```
- **Execution Logic**:
  1. Mock `userRepository.existsByEmail("existing@example.com")` returns `true`.
  2. `AuthService.register()` evaluates condition and raises `BadRequestException`.
- **Expected Outcome**:
  - Exception thrown: `com.studentmanagement.exception.BadRequestException: "Error: Email is already in use!"`.
  - Database save method is never invoked.
- **Actual Result**: **PASSED** (Execution time: `0.016 s`)

---

### TC-AUTH-03: Rejection of Teacher Registration Without Valid Invite Code
- **Test Objective**: Ensure unauthorized users cannot self-register as teachers without presenting the mandatory administrative invite code (`TEACHER_SECRET_2026`).
- **Test File / Method**: `AuthServiceTest.java` $\rightarrow$ `testTeacherRegistrationInvalidInviteCode()`
- **Input Data**:
  ```json
  {
    "name": "Fake Teacher",
    "email": "fake.teacher@example.com",
    "password": "Password123!",
    "role": "ROLE_TEACHER",
    "inviteCode": "WRONG_SECRET"
  }
  ```
- **Expected Outcome**:
  - Throws `BadRequestException` with message `"Invalid teacher invite code"`.
  - Account creation aborted.
- **Actual Result**: **PASSED** (Execution time: `0.002 s`)

---

### TC-AUTH-04: Successful Authentication and JWT Issuance
- **Test Objective**: Authenticate valid credentials, issue signed JWT access token and refresh token, and return profile metadata.
- **Test File / Method**: `AuthServiceTest.java` $\rightarrow$ `testLoginSuccess()`
- **Input Data**:
  ```json
  {
    "email": "alice@sms.edu",
    "password": "Password123!"
  }
  ```
- **Execution Logic**:
  1. `authenticationManager.authenticate()` validates credentials against user details.
  2. Generates access token using HMAC-SHA256 with 15-minute expiration.
  3. Generates refresh token and persists record into `refresh_tokens` table with 7-day expiration.
- **Expected Outcome**:
  - `JwtResponse` returned containing `token`, `refreshToken`, `type="Bearer"`, `id=1`, `email="alice@sms.edu"`, `role="ROLE_STUDENT"`.
- **Actual Result**: **PASSED** (Execution time: `0.533 s`)

---

### TC-AUTH-05: Rejection of Bad Credentials
- **Test Objective**: Ensure incorrect passwords trigger an immediate `BadCredentialsException`.
- **Test File / Method**: `AuthServiceTest.java` $\rightarrow$ `testLoginBadCredentials()`
- **Input Data**:
  ```json
  {
    "email": "alice@sms.edu",
    "password": "WrongPassword!"
  }
  ```
- **Expected Outcome**:
  - `BadCredentialsException` caught and mapped to HTTP 401 with standard error JSON.
- **Actual Result**: **PASSED** (Execution time: `0.008 s`)

---

### TC-SEC-01 to TC-SEC-05: Role-Based Route Protection & MockMvc Tests

Executed in `SecurityAndAuthorizationIntegrationTest.java`:

| Scenario ID | Test Method | HTTP Request | Role Context | Expected Status | Actual Status | Time |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **TC-SEC-01** | `testUnauthenticatedReturns401` | `GET /api/v1/students` | None (Anonymous) | **401 Unauthorized** | **401** | `0.031 s` |
| **TC-SEC-02** | `testStudentForbiddenOnTeacherEndpoint` | `GET /api/v1/students` | `ROLE_STUDENT` | **403 Forbidden** | **403** | `0.009 s` |
| **TC-SEC-03** | `testStudentForbiddenOnAwardPoints` | `POST /api/v1/points/award` | `ROLE_STUDENT` | **403 Forbidden** | **403** | `0.750 s` |
| **TC-SEC-04** | `testTeacherAuthorizedOnTeacherDashboard` | `GET /api/v1/students` | `ROLE_TEACHER` | **200 OK** | **200** | `0.055 s` |
| **TC-SEC-05** | `testPublicEndpointsAccessible` | `POST /api/v1/auth/login` | None (Public) | **400/200 (Not 401)** | **400 (Bad Body)** | `0.030 s` |

---

## 3. Frontend Authentication State Tests (Jest)

Executed in `frontend/__tests__/authSlice.test.js`:

```
PASS __tests__/authSlice.test.js
  Auth Redux Slice
    √ should return initial state on unknown action (4 ms)
    √ should clear auth errors (0 ms)
    √ should update profile points and rank dynamically (1 ms)
    √ loginUser.fulfilled updates state with authenticated user and token (0 ms)
    √ logoutUser.fulfilled cleans up authentication state (1 ms)
```

### Detailed State Transitions:
1. **Initial State Verification**:
   ```javascript
   {
     user: null,
     token: null,
     refreshToken: null,
     isAuthenticated: false,
     isLoading: false,
     error: null
   }
   ```
2. **`loginUser.fulfilled` Reducer**:
   - Updates `user` with response payload `{ id: 1, name: 'Alice', role: 'ROLE_STUDENT' }`.
   - Stores `token` and `refreshToken`.
   - Flags `isAuthenticated = true` and `isLoading = false`.
3. **`logoutUser.fulfilled` Reducer**:
   - Reverts state back to `user = null`, `token = null`, `isAuthenticated = false`.
   - Ensures memory state is cleaned up alongside `SecureStore` deletion.

---

## 4. Summary & Verification Conclusion

All **13 Authentication & RBAC test conditions** passed without failure. Both backend filter chains and frontend state guards strictly prevent privilege escalation.

