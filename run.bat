@echo off
title Chat Application Launcher
echo =================================================================
echo   Starting React + FastAPI Chat Application Dev Environment...
echo =================================================================

:: Kill any process already using port 8000 or 5173
echo [0/2] Clearing ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Get the directory where run.bat lives
set "ROOT=%~dp0"

:: Start backend in a new console window using absolute path
echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
start "FastAPI Backend" cmd /k "cd /d "%ROOT%backend" && if not exist venv (python -m venv venv) && call venv\Scripts\activate && pip install -r requirements.txt -q && echo. && echo  Backend ready at http://localhost:8000 && uvicorn app.main:app --reload"

:: Wait 2 seconds then start frontend
timeout /t 2 /nobreak >nul

:: Start frontend in a new console window using absolute path
echo [2/2] Launching Vite React Frontend on http://localhost:5173 ...
start "React Frontend" cmd /k "cd /d "%ROOT%frontend" && npm install --silent && echo. && echo  Frontend ready at http://localhost:5173 && npm run dev"

:: Wait 4 seconds then open browser
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"

echo =================================================================
echo   Both servers launched! Browser opening...
echo   Backend  ^> http://localhost:8000
echo   Frontend ^> http://localhost:5173
echo   API Docs ^> http://localhost:8000/docs
echo =================================================================
pause
