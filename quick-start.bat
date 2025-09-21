@echo off
echo ========================================
echo Las Piñas Traffic Payment System
echo Quick Start Script for Windows
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)
echo ✅ npm found

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found
    echo Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created
    echo.
    echo ⚠️  Please edit .env file with your configuration before continuing
    echo.
    pause
)

echo.
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo Testing setup...
npm run test-setup
if %errorlevel% neq 0 (
    echo ❌ Setup test failed
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo Starting the development server...
echo The server will be available at http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
npm run dev

pause



