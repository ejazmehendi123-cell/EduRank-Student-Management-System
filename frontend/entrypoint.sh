#!/bin/sh

cat << "EOF"

================================================================================
  🎓 STUDENT MANAGEMENT SYSTEM IS READY!
================================================================================
  👉 Web Application:     http://localhost:8082
  👉 REST API Backend:    http://localhost:8081/api/v1
  👉 Database (Postgres): localhost:5434

  Demo Credentials:
    Teacher: teacher@sms.edu | Password: Password123!
    Student: alice@sms.edu   | Password: Password123!
================================================================================

EOF

exec nginx -g "daemon off;"
