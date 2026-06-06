@echo off
title Chat Application Launcher
echo =================================================================
echo   Starting React + FastAPI Chat Application Dev Environment...
echo =================================================================

:: Start backend in a new console window
echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
start "FastAPI Backend" cmd /k "cd backend && if not exist venv (python -m venv venv) && call venv\Scripts\activate && pip install -r requirements.txt && uvicorn app.main:app --reload"

:: Start frontend in a new console window
echo [2/2] Launching Vite React Frontend on http://localhost:5173 ...
start "React Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo =================================================================
echo   Done! Both servers have been launched in separate windows.
echo   - Backend Logs window: "FastAPI Backend"
echo   - Frontend Logs window: "React Frontend"
echo =================================================================
pause
