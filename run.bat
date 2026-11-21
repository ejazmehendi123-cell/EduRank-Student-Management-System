@echo off
echo Starting Student Management System containers...
docker compose up -d --build
echo.
echo ================================================================================
echo   * STUDENT MANAGEMENT SYSTEM READY!
echo ================================================================================
echo   * Web Application:     http://localhost:8082
echo   * REST API Backend:    http://localhost:8081/api/v1
echo   * Database (Postgres): localhost:5434
echo.
echo   Demo Accounts:
echo     Teacher: teacher@sms.edu ^| Password: Password123!
echo     Student: alice@sms.edu   ^| Password: Password123!
echo ================================================================================
echo.
