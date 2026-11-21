# Test Condition Report: 03 — Points Distribution & Transaction Mechanics

## 1. Overview and Scope

This document details the test conditions, transactional atomicity, balance integrity constraints, audit logging rules, and test execution results for the **Points Distribution & Transaction Mechanics Subsystem**.

- **Backend Target**: [`PointsController.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/controller/PointsController.java), [`PointsService.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/service/PointsService.java), [`PointTransactionRepository.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/repository/PointTransactionRepository.java), [`StudentProfileRepository.java`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/backend/src/main/java/com/studentmanagement/repository/StudentProfileRepository.java)
- **Frontend Target**: [`pointsSlice.js`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/frontend/src/features/points/pointsSlice.js), [`pointsThunks.js`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/frontend/src/features/points/pointsThunks.js), [`AwardPointsScreen.js`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/frontend/src/screens/teacher/AwardPointsScreen.js)
- **Database Target**: `student_profiles` (`CHECK (total_points >= 0)`), `point_transactions` (Audit log)

---

## 2. Integrity & Business Rules

1. **Teacher Authorization Only**: Only authenticated users with `ROLE_TEACHER` may award or adjust points.
2. **Transactional Atomicity (`@Transactional`)**: Updating student's point tally and recording the transaction in `point_transactions` must execute in a single ACID transaction. If either fails, all mutations rollback.
3. **Strict Non-Negative Balance**:
   - Application Layer: `PointsService` validates `currentPoints - deduction >= 0`.
   - Database Layer: `CHECK (total_points >= 0)` constraint in PostgreSQL schema.
4. **Audit Trail**: Every adjustment retains `points`, `type` (`AWARD` vs `ADJUSTMENT`), `reason`, `awarded_by` (Teacher ID), and `created_at`.

---

## 3. Test Condition Specifications & Results

### Summary Test Matrix

| Test ID | Test Target | Test Scenario / Objective | Expected Balance / Outcome | Status | Time |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **TC-PT-01** | `PointsService` | Successful point award by teacher (+50 pts) | Balance incremented (100 -> 150) | **PASS** | 5 ms |
| **TC-PT-02** | `PointsService` | Reject zero or negative point award requests | Throws `BadRequestException` | **PASS** | 86 ms |
| **TC-PT-03** | `PointsService` | Successful point adjustment deduction (-30 pts) | Balance reduced (100 -> 70) | **PASS** | 3 ms |
| **TC-PT-04** | `PointsService` | Prevent deduction exceeding balance (-150 pts) | Throws `BadRequestException` | **PASS** | 3 ms |
| **TC-PT-05** | `PointsService` | Transaction audit log creation and idempotency | Audit entry recorded with teacher ID | **PASS** | 2 ms |
| **TC-FE-VAL-04** | `validators.js` | Positive integer input validation | Rejects decimals, zeros, negatives | **PASS** | 1 ms |
| **TC-FE-AUTH-03** | `authSlice` | Profile points and rank dynamic sync | User profile updated in Redux | **PASS** | 1 ms |

---

### Detailed Test Specifications

### TC-PT-01: Successful Point Award
- **Test Objective**: Verify that a teacher can award points to a student, incrementing the student's `total_points` and generating a persistent audit log entry.
- **Test File / Method**: `PointsServiceTest.java` $\rightarrow$ `testAwardPointsSuccess()`
- **Input Data**:
  ```json
  {
    "studentId": 1,
    "points": 50,
    "reason": "Excellence in Cloud Architecture Workshop"
  }
  ```
- **Execution & Balance Change**:
  - Initial Balance: `100` points
  - Points to Add: `+50` points
  - Computed Balance: `150` points
- **Expected Outcome**:
  - `studentProfile.getTotalPoints()` updated to `150`.
  - Transaction saved with `type = TransactionType.AWARD`, `points = 50`, `reason = "Excellence in Cloud Architecture Workshop"`.
  - Returned DTO contains updated `newTotalPoints = 150`.
- **Actual Result**: **PASSED** (Execution Time: `0.005 s`)

---

### TC-PT-02: Rejection of Zero or Negative Point Awards
- **Test Objective**: Verify that attempting to award zero or negative points triggers validation failure.
- **Test File / Method**: `PointsServiceTest.java` $\rightarrow$ `testAwardPointsZeroOrNegative()`
- **Input Data**:
  - Sub-case A: `points = 0`
  - Sub-case B: `points = -25`
- **Expected Outcome**:
  - Throws `BadRequestException` with message `"Points awarded must be greater than zero"`.
  - Profile point balance remains unchanged.
  - No transaction record is saved.
- **Actual Result**: **PASSED** (Execution Time: `0.086 s`)

---

### TC-PT-03: Successful Point Adjustment (Deduction)
- **Test Objective**: Verify that a teacher can legitimately deduct points for disciplinary or adjustment reasons when sufficient balance exists.
- **Test File / Method**: `PointsServiceTest.java` $\rightarrow$ `testAdjustPointsDeductSuccess()`
- **Input Data**:
  ```json
  {
    "studentId": 1,
    "points": -30,
    "reason": "Late lab report submission"
  }
  ```
- **Execution & Balance Change**:
  - Initial Balance: `100` points
  - Adjustment Amount: `-30` points
  - Computed Balance: `70` points
- **Expected Outcome**:
  - `studentProfile.getTotalPoints()` reduced to `70`.
  - Transaction recorded with `type = TransactionType.ADJUSTMENT`.
  - Returned DTO confirms `newTotalPoints = 70`.
- **Actual Result**: **PASSED** (Execution Time: `0.003 s`)

---

### TC-PT-04: Prevention of Negative Balance on Excess Deductions
- **Test Objective**: Verify that deducting more points than a student possesses is strictly blocked, safeguarding against negative balances.
- **Test File / Method**: `PointsServiceTest.java` $\rightarrow$ `testAdjustPointsPreventNegativeBalance()`
- **Input Data**:
  ```json
  {
    "studentId": 1,
    "points": -150,
    "reason": "Severe disciplinary deduction"
  }
  ```
- **Preconditions**:
  - Student initial balance is `100` points.
  - Attempted deduction is `150` points ($100 - 150 = -50$).
- **Expected Outcome**:
  - Service evaluates: `if (newPoints < 0) throw new BadRequestException(...)`.
  - Throws `BadRequestException: "Student cannot have negative points. Current points: 100"`.
  - Student profile is not saved; rollback occurs.
- **Actual Result**: **PASSED** (Execution Time: `0.003 s`)

---

### TC-PT-05: Transaction Audit Logging and Idempotency
- **Test Objective**: Verify that each point modification retains immutable metadata linking the awarding teacher and student.
- **Test File / Method**: `PointsServiceTest.java` $\rightarrow$ `testIdempotentTransaction()`
- **Evaluation**:
  - Verifies that `pointTransactionRepository.save(any(PointTransaction.class))` receives:
    - Non-null `createdAt`
    - Correct foreign key references for `student` and `awardedBy`
    - Exact reason string matching input
- **Actual Result**: **PASSED** (Execution Time: `0.002 s`)

---

## 4. Frontend Point Distribution & History Verification

- **Form Validation ([`validators.js`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/frontend/src/utils/validators.js))**:
  - Tested in `validators.test.js`:
    ```javascript
    test('isPositiveInteger checks valid positive whole numbers', () => {
      expect(isPositiveInteger('50')).toBe(true);
      expect(isPositiveInteger('0')).toBe(false);
      expect(isPositiveInteger('-10')).toBe(false);
      expect(isPositiveInteger('12.5')).toBe(false);
      expect(isPositiveInteger('abc')).toBe(false);
    });
    ```
  - Result: **PASSED (1 ms)**
- **Redux State Sync ([`authSlice.test.js`](file:///c:/Users/Krishna/Desktop/Honors/Student%20Managemant%20System/frontend/__tests__/authSlice.test.js))**:
  - Tested dynamic profile update on point transaction:
    ```javascript
    test('should update profile points and rank dynamically', () => {
      const stateWithProfile = {
        ...initialState,
        user: { id: 1, role: 'ROLE_STUDENT', profile: { totalPoints: 100, rank: 5 } }
      };
      const state = authReducer(stateWithProfile, updateProfilePoints({ totalPoints: 150, rank: 2 }));
      expect(state.user.profile.totalPoints).toBe(150);
      expect(state.user.profile.rank).toBe(2);
    });
    ```
  - Result: **PASSED (1 ms)**

---

## 5. Summary & Verification Conclusion

All **7 Points and Transaction Mechanics test conditions** passed with zero defects. Negative balances are prevented at both the service layer and database schema constraint, audit logs are generated immutably, and point updates immediately propagate to client state.

