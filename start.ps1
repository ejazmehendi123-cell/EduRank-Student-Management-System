Write-Host "Starting Student Management System containers..." -ForegroundColor Cyan
docker compose up -d --build
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "  🎓 STUDENT MANAGEMENT SYSTEM READY!" -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Green
Write-Host "  👉 Web Application:     http://localhost:8082" -ForegroundColor Cyan
Write-Host "  👉 REST API Backend:    http://localhost:8081/api/v1" -ForegroundColor Cyan
Write-Host "  👉 Database (Postgres): localhost:5434" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Demo Accounts:" -ForegroundColor White
Write-Host "    Teacher: teacher@sms.edu | Password: Password123!" -ForegroundColor White
Write-Host "    Student: alice@sms.edu   | Password: Password123!" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor Green
Write-Host ""
