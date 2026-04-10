@echo off
echo Starting Backend Server...
start "Backend Server" cmd /k "node index.js"

echo Starting Frontend Application...
cd ma-traders-frontend
start "Frontend Application" cmd /k "npm start"

echo Project Started!
