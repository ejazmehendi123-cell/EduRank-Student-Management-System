# Student Management System — Complete Run & Execution Guide

This system is containerized with **Docker Compose**. With a single command, the entire multi-tier stack (PostgreSQL database, Spring Boot backend API, and React Native Web frontend) starts automatically.

---

## 🚀 Quickest Way to Run Everything (Single Command with Terminal Links)

Run either of these commands in your project root:

```powershell
# Using the Windows batch runner (prints links directly):
.\run.bat

# Or using the PowerShell runner:
.\start.ps1

# Or standard Docker Compose:
docker compose up
```

### What Prints Automatically in Your Terminal:

```text
================================================================================
  🎓 STUDENT MANAGEMENT SYSTEM READY!
================================================================================
  👉 Web Application:     http://localhost:8082
  👉 REST API Backend:    http://localhost:8081/api/v1
  👉 Database (Postgres): localhost:5434

  Demo Accounts:
    Teacher: teacher@sms.edu | Password: Password123!
    Student: alice@sms.edu   | Password: Password123!
================================================================================
```

---

## 📱 Running on Android Studio (Android Emulator)

When running the native Android build on Android Studio's Emulator, the app connects to the running `sms_backend` container:

### 1. Start the Android Emulator
* In Android Studio, launch your preferred virtual device (e.g. `Pixel_9a` with API 34).
* Ensure it is detected:
  ```powershell
  adb devices
  # Output: emulator-5554 device
  ```

### 2. Map Emulator Port to Backend Container
Run the reverse port bridge so the Android emulator can reach the backend at `localhost:8081`:
```powershell
adb reverse tcp:8081 tcp:8081
```

### 3. Build & Install the Native APK
```powershell
cd frontend/android
.\gradlew.bat :app:installDebug --project-cache-dir C:\Users\Krishna\AppData\Local\Temp\sms-gradle
```

### 4. Launch the App on the Emulator
Click the **StudentManagement** icon on your emulator, or run:
```powershell
adb shell am start -n com.studentmanagement.app/.MainActivity
```

---

## ⚡ Running via Expo Dev Server (Optional / Development Mode)

If you are modifying frontend UI code and want live hot-reloading:

```powershell
cd frontend

# Install dependencies (first time only)
npm install --legacy-peer-deps

# Start Expo on port 8083 (to avoid conflicts with containers)
npx expo start -c --port 8083
```
* Press **`w`** to open in web browser.
* Press **`a`** to open on active Android emulator.
* Scan the QR code with **Expo Go** on a physical phone connected to the same Wi-Fi.

---

## 🔑 Pre-Seeded Demo Accounts for Immediate Testing

| Role | Email | Password | Permissions & Initial State |
| :--- | :--- | :--- | :--- |
| **TEACHER** | `teacher@sms.edu` | `Password123!` | Full administrative access to award/deduct points and manage students |
| **STUDENT** | `alice@sms.edu` | `Password123!` | Roll: CS001, Computer Science (Semester 5) |
| **TEACHER (Alt)** | `teacher@school.edu` | `Password123!` | Pre-seeded baseline teacher account |

> **Teacher Registration Note**: To register a new Teacher account through the Sign Up screen, use the administrative invite code: `TEACHER_SECURE_KEY_2026`.

---

## 🛠️ Docker Compose Management Commands

```powershell
# Check status of all containers
docker compose ps

# View live backend logs
docker compose logs -f backend

# View frontend web server logs
docker compose logs -f frontend

# Stop all containers
docker compose down

# Stop and wipe database volume (clean reset)
docker compose down -v
```

---

## 🧪 Running Automated Tests

```powershell
# Run Backend Test Suite (18 tests)
cd backend
.\mvnw.cmd test

# Run Frontend Test Suite (12 tests)
cd frontend
npm test -- --verbose
```
