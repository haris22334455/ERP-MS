@echo off
echo Starting Spring Boot Backend Server...
start "Backend Server" cmd /k "cd erp-backend && mvnw.cmd spring-boot:run"

echo Starting Frontend Application...
cd erp-frontend
start "Frontend Application" cmd /k "npm start"

echo Project Started!
