# 🎓 EduRank - Full-Stack Student Management & Leaderboard System

EduRank is an enterprise-grade, full-stack Student Management System built with a **React Native (Expo)** mobile frontend, a **Java Spring Boot 3.x** backend, and a containerized **PostgreSQL** database managed via **Docker Compose**.

It implements role-based access control (RBAC) for **STUDENTS** and **TEACHERS**, real-time competition ranking with tie handling, teacher-controlled point distribution with ACID transactions, server-side pagination, light/dark themes, and persistent JWT authentication.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│             Mobile Frontend (React Native Expo)        │
│  - Redux Toolkit (State)    - Context API (Theme)      │
│  - Expo SecureStore (Auth)  - Axios with JWT Interceptors│
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (HTTP)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Backend (Spring Boot 3.3.5 / Java 21)       │
│  - Spring Security (Stateless JWT Filter & RBAC)       │
│  - Spring Data JPA + Hibernate (ORM)                   │
│  - Flyway Migrations (Schema Versioning & Seed Data)  │
│  - Centralized Exception Handling (@RestControllerAdvice)│
└───────────────────────────┬────────────────────────────┘
                            │ JDBC (Port 5434)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Database (PostgreSQL 16 in Docker)          │
│  - users, student_profiles, point_transactions, tokens │
│  - SQL Window Functions (RANK() OVER ())               │
│  - CHECK constraints (total_points >= 0)               │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

1. **Role-Based Portals**:
   - **Student Portal**: Personal academic overview, current rank, total points, recent awards history, full leaderboard, and profile.
   - **Teacher Portal**: Faculty dashboard, student roster management, competition leaderboard, interactive point awarding and adjustment controls, and transaction audits.
2. **Competition Leaderboard**:
   - Calculates global ranks using `RANK() OVER (ORDER BY total_points DESC)` in PostgreSQL before pagination.
   - Tied scores share the same rank, and the subsequent rank is skipped (e.g. 1st: 950, 2nd: 900, 2nd: 900, 4th: 850).
   - Secondary tiebreaker (`student_id ASC`) ensures deterministic pagination.
   - Global rank and current student rank are surfaced in every response.
3. **Point Distribution & Transaction Engine**:
   - Only authenticated faculty (`ROLE_TEACHER`) can award or adjust points.
   - ACID transactional execution (`@Transactional`) guarantees points and transaction ledger update atomically.
   - Defensive checks strictly prevent negative balances (`total_points >= 0`).
   - Idempotency key support prevents duplicate point awards on network retries.
4. **Security & Session Persistence**:
   - BCrypt password hashing.
   - JWT Access tokens (24h) + Refresh tokens (7 days).
   - Expo SecureStore persists tokens securely across mobile app restarts.
   - Axios request and response interceptors handle transparent token refreshment without race conditions.
5. **Theme Management**:
   - Dual theme support: **Light** and **Dark** mode.
   - Global `ThemeContext` immediately updates typography, cards, and backgrounds across all screens.
   - Theme preference persists locally across sessions.

---

## 📁 Repository Structure

```
.
├── backend/                               # Spring Boot 3.x Backend
│   ├── pom.xml                            # Maven dependencies & build config
│   ├── mvnw, mvnw.cmd                     # Maven wrapper scripts
│   ├── src/main/java/com/studentmanagement/
│   │   ├── config/                        # SecurityConfig, CorsConfig
│   │   ├── controller/                    # Auth, Student, Leaderboard, Points, Teacher
│   │   ├── dto/request/                   # RegisterRequest, LoginRequest, AwardPointsRequest...
│   │   ├── dto/response/                  # AuthResponse, LeaderboardPageResponse...
│   │   ├── entity/                        # User, StudentProfile, PointTransaction, RefreshToken
│   │   ├── enums/                         # Role (STUDENT, TEACHER), TransactionType
│   │   ├── exception/                     # GlobalExceptionHandler, Custom Exceptions
│   │   ├── repository/                    # JPA & Native Query Repositories
│   │   ├── security/                      # JwtAuthenticationFilter, JwtTokenProvider, CustomUserDetails
│   │   └── service/                       # AuthService, PointsService, LeaderboardService...
│   ├── src/main/resources/
│   │   ├── application.yml                # Spring configuration
│   │   └── db/migration/V1__init_schema.sql # Flyway migration & default demo seeds
│   └── src/test/java/                     # JUnit 5 & MockMvc integration tests
│
├── frontend/                              # React Native Expo Mobile App
│   ├── App.js                             # App Entry (Redux Provider + ThemeProvider)
│   ├── app.json                           # Expo app configuration
│   ├── package.json                       # Dependencies & scripts
│   ├── src/
│   │   ├── app/                           # Redux store and typed hooks
│   │   ├── components/                    # Button, Input, Header, StudentCard, LeaderboardItem...
│   │   ├── contexts/                      # ThemeContext (Light & Dark mode)
│   │   ├── features/                      # Redux slices & thunks (auth, students, leaderboard, points)
│   │   ├── navigation/                    # RootNavigator, AuthNavigator, StudentNavigator, TeacherNavigator
│   │   ├── screens/                       # Auth, Student, and Teacher screen components
│   │   ├── services/                      # Axios client with JWT interceptor, SecureStore token storage
│   │   ├── theme/                         # Color palettes & typography
│   │   └── utils/                         # Validators, formatters, constants
│   └── __tests__/                         # Jest frontend unit tests
│
├── docker-compose.yml                     # PostgreSQL 16 container definition
├── .env.example                           # Template for environment variables
├── .env                                   # Active configuration
├── postman_collection.json                # Postman API Collection
└── README.md                              # Complete setup and demonstration guide
```

---

## 🛠️ Prerequisites

- **Java**: OpenJDK 21 or newer
- **Node.js**: v18 or newer (v24.x tested)
- **Docker & Docker Compose**: Docker Desktop or engine running
- **Expo Go** (Optional for physical device): Installed on Android/iOS via App Store / Play Store

---

## ⚙️ Quick Start Guide

> 📖 **Full Multi-Platform Execution Guide**: See [**RUN_GUIDE.md**](./RUN_GUIDE.md) for step-by-step instructions on running the system on **Web**, **Android Studio (Emulator)**, and **Expo**.

### Step 1: Start PostgreSQL Database

Run Docker Compose to launch the isolated PostgreSQL container:

```bash
docker compose up -d
```

Verify that the database container is healthy:
```bash
docker ps --filter "name=sms_postgres"
```
The database runs on host port **`5434`** (mapped to container port `5432`) to prevent conflicts with local database installations.

---

### Step 2: Build & Start Spring Boot Backend

From the project root:

```bash
# Run backend tests (18 tests verifying auth, ranking, points, RBAC)
.\mvnw.cmd test

# Run backend application
.\mvnw.cmd -f backend\pom.xml spring-boot:run
```

Or run the packaged JAR directly:
```bash
java -jar backend/target/student-management-system-1.0.0.jar
```

The backend starts at: **`http://localhost:8081`**  
Flyway automatically creates the schema and seeds demo accounts.

---

### Step 3: Start React Native Expo Frontend

Navigate to `frontend/`:

```bash
cd frontend

# Run frontend tests (12 tests verifying slices and validators)
npm test

# Start Expo dev server
npx expo start
```

- Press **`w`** in the terminal to open the web version in your browser.
- Press **`a`** to open in Android Studio Emulator.
- Or scan the QR code with the **Expo Go** app on your physical mobile device.

---

## 🔑 Default Credentials & Demo Accounts

All seed accounts use the password: **`Password@123`**

| Role | Name | Email | Initial Points | Initial Rank |
| :--- | :--- | :--- | :--- | :--- |
| **TEACHER** | Professor Sharma | `teacher@school.edu` | - | - |
| **STUDENT** | Rahul Verma | `rahul@student.edu` | 950 pts | 🥇 1st |
| **STUDENT** | Priya Nair | `priya@student.edu` | 900 pts | 🥈 2nd (Tied) |
| **STUDENT** | Amit Patel | `amit@student.edu` | 900 pts | 🥈 2nd (Tied) |
| **STUDENT** | Sneha Rao | `sneha@student.edu` | 850 pts | 4th (Skipped 3rd) |

> 💡 **Teacher Registration Key**: To create a new teacher account via registration, use the invite code:  
> `TEACHER_SECURE_KEY_2026`

---

## 📱 Running on Android Studio & Android Emulator

The project includes the full native Android configuration inside `frontend/android/`.

### Option A: Direct Command-Line Run to Emulator
1. Start your Android Emulator in Android Studio (or from CLI):
   ```bash
   emulator -avd Pixel_9a
   ```
2. Build and install the APK directly to the emulator:
   ```bash
   cd frontend\android
   .\gradlew.bat --project-cache-dir C:\Users\Krishna\AppData\Local\Temp\sms-gradle installDebug
   ```
3. Launch the application:
   ```bash
   adb shell am start -n com.studentmanagement.app/.MainActivity
   ```

### Option B: Open in Android Studio IDE
1. Open **Android Studio** (`C:\Program Files\Android\Android Studio`).
2. Select **Open** and choose the directory:
   `frontend/android`
3. Allow Android Studio to sync Gradle.
4. Select target device (e.g. `Pixel_9a` or `Pixel_10a`) and click **Run 'app'** (`Shift + F10`).
5. The emulator connects seamlessly to the Spring Boot backend via host loopback `http://10.0.2.2:8081/api/v1`.

---

## 📡 REST API Reference

Base URL: `/api/v1`

### 1. Authentication (`/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new student or teacher (with invite key) |
| `POST` | `/auth/login` | Public | Authenticate with email/password; returns JWT |
| `POST` | `/auth/refresh` | Public | Exchange refresh token for new access token |
| `POST` | `/auth/logout` | Authenticated | Revoke refresh token and clear session |
| `GET` | `/auth/me` | Authenticated | Get current authenticated user details |

### 2. Leaderboard (`/leaderboard`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/leaderboard` | Authenticated | Paged leaderboard (`?page=0&size=10&sort=totalPoints,desc`) |
| `GET` | `/leaderboard/me` | Student | Retrieve authenticated student's rank |

### 3. Points Management (`/points`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/points/award` | **Teacher Only** | Award positive points to a student |
| `POST` | `/points/adjust` | **Teacher Only** | Adjust points (+ or -; prevents negative total) |
| `GET` | `/points/history/{studentId}` | Authenticated | Get point ledger for target student |

### 4. Student & Teacher Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/students/me` | Student | Get authenticated student's profile & rank |
| `GET` | `/students/me/points-history` | Student | Get authenticated student's transactions |
| `GET` | `/students/{id}` | Authenticated | Get student profile by ID |
| `GET` | `/teacher/dashboard` | **Teacher Only** | Faculty summary metrics & top performers |
| `GET` | `/teacher/students` | **Teacher Only** | Paginated student roster with search |

---

## 🧪 Automated Testing

### Backend Tests (JUnit 5 + MockMvc + Mockito)

```bash
.\mvnw.cmd test
```

Verifies:
- User registration success and student profile creation
- Rejection of duplicate email addresses
- Rejection of unauthorized teacher creation without valid invite code
- Login authentication and password hash verification
- Student forbidden (401 / 403) from teacher-only endpoints
- Teacher authorization on `/teacher/dashboard` and `/points/award`
- Competition ranking tie calculation (`1st, 2nd, 2nd, 4th`)
- Prevention of negative balances during point deductions
- Transaction idempotency preventing duplicate submissions

### Frontend Tests (Jest)

```bash
cd frontend
npm test
```

Verifies:
- Form validation for emails, passwords, and roll numbers
- Redux `authSlice` login lifecycle, session restoration, and logout cleanup
- Dynamic profile point updates
- Redux `leaderboardSlice` pagination metadata and tie-rank ingestion

---

## 🎬 Live Demonstration Walkthrough

1. **Start the Database & Backend**:
   - `docker compose up -d`
   - `java -jar backend/target/student-management-system-1.0.0.jar`
2. **Start the Frontend**:
   - `cd frontend && npx expo start --web` (or run on mobile emulator).
3. **Log in as Student**:
   - Tap **"🎓 Student Demo"** or enter `rahul@student.edu` / `Password@123`.
   - Observe Rank **#1**, **950 pts**, and academic overview.
   - Navigate to the **Leaderboard** tab to view the live rankings. Notice students Priya & Amit are tied at Rank #2 with 900 points.
4. **Log in as Teacher**:
   - Log out, then tap **"👨‍🏫 Teacher Demo"** (`teacher@school.edu` / `Password@123`).
   - Observe faculty metrics: Enrolled Students, Total Points Distributed, and Top Performers.
5. **Award Points & Observe Real-Time Rank Change**:
   - Go to **Leaderboard** or **Students**. Select **Sneha Rao** (Rank 4, 850 pts).
   - Tap **"Award Points"**, select `+75`, enter reason `"Won National Robotics Hackathon"`, and submit.
   - Sneha's score immediately increases to **925 pts**, and her rank leaps to **Rank #2**!
   - Priya and Amit move to Rank #3 (Tied).
6. **Test Negative Balance Guard**:
   - Select a student with 0 points (or low points) and attempt to deduct more than their total.
   - The backend rejects the request with HTTP 400: *"Total points cannot be negative"*.
7. **Toggle Theme**:
   - Tap the moon/sun icon in the header to switch between Light and Dark themes. Observe immediate palette adaptation.

