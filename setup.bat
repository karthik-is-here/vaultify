@echo off
echo ================================
echo   Vaultify — Setup
echo ================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  echo Please download and install it from https://nodejs.org
  pause
  exit /b 1
)

echo Node.js found. Installing dependencies...
npm install

echo.
echo ================================
echo Done! To start Vaultify, run:
echo   npm run electron-dev
echo.
echo To build an installer, run:
echo   npm run dist
echo ================================
pause
