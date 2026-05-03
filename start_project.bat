@echo off
echo Starting Spring Boot Backend Server...
start "Backend Server" cmd /k "cd ma-traders-backend && mvnw.cmd spring-boot:run"

echo Starting Frontend Application...
cd ma-traders-frontend
start "Frontend Application" cmd /k "npm start"

echo Project Started!
