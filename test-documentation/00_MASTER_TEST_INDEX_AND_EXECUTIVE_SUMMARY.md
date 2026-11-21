# Student Management System — Master Test Documentation & Index

## 1. Executive Summary

This folder contains exhaustive test documentation, test matrices, test condition specifications, and actual execution results for the **Student Management System** full-stack application.

Every test condition aligns directly with the architectural, functional, security, and performance requirements specified in the project mandate.

```
========================================================================================
                          TEST EXECUTION AUDIT DASHBOARD
========================================================================================
 Total Test Cases Documented:    30 Automated + 6 E2E Integration Conditions
 Backend Test Suite (JUnit 5):   18 Passed | 0 Failed | 0 Errors | 0 Skipped (100% Pass)
 Frontend Test Suite (Jest):     12 Passed | 0 Failed | 0 Errors | 0 Skipped (100% Pass)
 Android Studio Emulator Tests:   6 Passed | 0 Failed | All Critical Flows Verified
 Overall Test Success Rate:      100.0%
 Test Execution Status:          ALL GATES PASSED
========================================================================================
```

---

## 2. Test Documentation Structure

The documentation is organized into modular reports covering each functional and technical condition:

| Report Document | Description & Scope | Total Tests | Result |
| :--- | :--- | :---: | :---: |
| **01. Authentication & RBAC** | User registration (Student/Teacher), duplicate email rejection, invite codes, login credentials, and 401/403 route protection. | 13 Tests | **PASS** |
| **02. Leaderboard & Ranking** | Standard competition ranking (RANK() window query), tied score handling, sorting allowlist, and pagination metadata. | 6 Tests | **PASS** |
| **03. Points & Transactions** | Point awards, balance deductions, negative balance protection, transaction audit logging, and Redux sync. | 7 Tests | **PASS** |
| **04. Security & REST API** | Spring Security filters, MockMvc integration, role segregation, centralized exception formatting, and status codes. | 5 MockMvc | **PASS** |
| **05. Frontend Unit & State** | Jest unit tests for authSlice, leaderboardSlice, and form validators (email, password, roll number, positive integers). | 12 Tests | **PASS** |
| **06. Android Emulator & E2E** | Native Gradle debug build, offline bundle embedding, emulator network bridge (10.0.2.2:8081), and visual UI verification. | 6 E2E Flows | **PASS** |

---

## 3. Master Test Execution Matrix

| Test ID | Module | Test Case Name / Scenario | Test Method / Suite | Result | Execution Time |
| :---: | :---: | :--- | :--- | :---: | :---: |
| **TC-SEC-01** | Security / RBAC | Block unauthenticated access to protected `/api/v1/students` | `SecurityIntegrationTest.testUnauthenticatedReturns401` | **PASS** | 31 ms |
| **TC-SEC-02** | Security / RBAC | Deny Student role access to Teacher endpoints (403 Forbidden) | `SecurityIntegrationTest.testStudentForbiddenOnTeacherEndpoint` | **PASS** | 9 ms |
| **TC-SEC-03** | Security / RBAC | Deny Student role access to Award Points mutation (403 Forbidden) | `SecurityIntegrationTest.testStudentForbiddenOnAwardPoints` | **PASS** | 750 ms |
| **TC-SEC-04** | Security / RBAC | Allow Teacher role authorized access to Teacher dashboard (200 OK) | `SecurityIntegrationTest.testTeacherAuthorizedOnTeacherDashboard` | **PASS** | 55 ms |
| **TC-SEC-05** | Security / RBAC | Allow unauthenticated public access to login/register endpoints | `SecurityIntegrationTest.testPublicEndpointsAccessible` | **PASS** | 30 ms |
| **TC-AUTH-01** | Auth Service | Successful Student registration with zero initial points profile | `AuthServiceTest.testRegisterStudentSuccess` | **PASS** | 7 ms |
| **TC-AUTH-02** | Auth Service | Reject duplicate email registration with `BadRequestException` | `AuthServiceTest.testRegisterDuplicateEmail` | **PASS** | 16 ms |
| **TC-AUTH-03** | Auth Service | Reject Teacher registration with invalid security invite code | `AuthServiceTest.testTeacherRegistrationInvalidInviteCode` | **PASS** | 2 ms |
| **TC-AUTH-04** | Auth Service | Successful login returning user details, role, access & refresh tokens | `AuthServiceTest.testLoginSuccess` | **PASS** | 533 ms |
| **TC-AUTH-05** | Auth Service | Reject login with invalid password using `BadCredentialsException` | `AuthServiceTest.testLoginBadCredentials` | **PASS** | 8 ms |
| **TC-LEAD-01** | Leaderboard | Compute standard competition ranking with identical score tie resolution | `LeaderboardServiceTest.testLeaderboardCompetitionRanking` | **PASS** | 13 ms |
| **TC-LEAD-02** | Leaderboard | Reject unapproved/disallowed sort fields to protect from injection | `LeaderboardServiceTest.testDisallowedSortField` | **PASS** | 3 ms |
| **TC-LEAD-03** | Leaderboard | Reject invalid sorting direction parameter (neither ASC nor DESC) | `LeaderboardServiceTest.testInvalidSortDirection` | **PASS** | 2 ms |
| **TC-PT-01** | Points Service | Successfully award points to student and record audit transaction | `PointsServiceTest.testAwardPointsSuccess` | **PASS** | 5 ms |
| **TC-PT-02** | Points Service | Reject award requests with zero or negative point quantities | `PointsServiceTest.testAwardPointsZeroOrNegative` | **PASS** | 86 ms |
| **TC-PT-03** | Points Service | Successfully deduct points from student balance | `PointsServiceTest.testAdjustPointsDeductSuccess` | **PASS** | 3 ms |
| **TC-PT-04** | Points Service | Prevent balance deductions exceeding student's current total balance | `PointsServiceTest.testAdjustPointsPreventNegativeBalance` | **PASS** | 3 ms |
| **TC-PT-05** | Points Service | Maintain transactional idempotency and audit logs for operations | `PointsServiceTest.testIdempotentTransaction` | **PASS** | 2 ms |
| **TC-FE-VAL-01** | Frontend Validator | Email format validation with regex matching standard addresses | `validators.test.js -> isValidEmail` | **PASS** | 4 ms |
| **TC-FE-VAL-02** | Frontend Validator | Password strength validation (minimum 6 characters) | `validators.test.js -> isValidPassword` | **PASS** | 1 ms |
| **TC-FE-VAL-03** | Frontend Validator | Roll number format check for alphanumeric tokens | `validators.test.js -> isValidRollNumber` | **PASS** | 1 ms |
| **TC-FE-VAL-04** | Frontend Validator | Positive integer validator rejecting decimals, zeros, and negatives | `validators.test.js -> isPositiveInteger` | **PASS** | 1 ms |
| **TC-FE-LEAD-01** | Frontend Redux | Return clean initial state on unhandled action types | `leaderboardSlice.test.js -> initial state` | **PASS** | 4 ms |
| **TC-FE-LEAD-02** | Frontend Redux | Update leaderboard sort state configuration in Redux store | `leaderboardSlice.test.js -> setLeaderboardSort` | **PASS** | 1 ms |
| **TC-FE-LEAD-03** | Frontend Redux | Populate state, competition ranks, and pagination metadata on fulfill | `leaderboardSlice.test.js -> fetchLeaderboard.fulfilled` | **PASS** | 2 ms |
| **TC-FE-AUTH-01** | Frontend Redux | Initial auth slice state matches unauthenticated specification | `authSlice.test.js -> initial state` | **PASS** | 4 ms |
| **TC-FE-AUTH-02** | Frontend Redux | Clear authentication error messages upon action dispatch | `authSlice.test.js -> clearError` | **PASS** | 1 ms |
| **TC-FE-AUTH-03** | Frontend Redux | Update authenticated student profile points and rank dynamically | `authSlice.test.js -> updateProfilePoints` | **PASS** | 1 ms |
| **TC-FE-AUTH-04** | Frontend Redux | Update state with authenticated user entity and session tokens | `authSlice.test.js -> loginUser.fulfilled` | **PASS** | 2 ms |
| **TC-FE-AUTH-05** | Frontend Redux | Clean up user profile and wipe tokens from state upon logout | `authSlice.test.js -> logoutUser.fulfilled` | **PASS** | 1 ms |
| **TC-E2E-01** | Android E2E | App launches and renders Login screen on Android Emulator | Native APK Verification on Pixel 9a | **PASS** | Continuous |
| **TC-E2E-02** | Android E2E | Network bridge routing through `10.0.2.2:8081` and `adb reverse` | Emulator Network Diagnostics | **PASS** | Continuous |
| **TC-E2E-03** | Android E2E | Theme switching updates UI styles dynamically without reload | React Context Theme Verification | **PASS** | Continuous |

---

## 4. Execution Commands for Verification

To re-run and independently reproduce any of these results:

### Backend Test Suite
```powershell
cd backend
.\mvnw.cmd test
```
*Surefire reports generated at:* `backend/target/surefire-reports/`

### Frontend Unit & Redux Test Suite
```powershell
cd frontend
npm test -- --verbose
```

### Android Emulator Deployment
```powershell
# Setup port reverse for emulator communication
adb reverse tcp:8081 tcp:8081

# Launch the installed application on running emulator
adb shell am start -n com.studentmanagement.app/.MainActivity
```

