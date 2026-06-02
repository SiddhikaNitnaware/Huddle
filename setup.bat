@echo off
echo ========================================
echo    Huddle Setup Script
echo ========================================
echo.

echo [1/3] Installing Server Dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Server dependency installation failed!
    pause
    exit /b 1
)
echo Server dependencies installed successfully!
echo.

echo [2/3] Installing Client Dependencies...
cd ..
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Client dependency installation failed!
    pause
    exit /b 1
)
echo Client dependencies installed successfully!
echo.

echo [3/3] Checking Environment Configuration...
if not exist "server\.env" (
    echo WARNING: server\.env file not found!
    echo Please create server\.env with:
    echo   MONGO_URI=your_mongodb_connection_string
    echo   PORT=5000
    echo   JWT_SECRET=your_secret_key
    echo.
) else (
    echo Environment file found!
)

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Configure server\.env if not done yet
echo 2. Start server: cd server ^&^& node index.js
echo 3. Start client: npm start
echo.
echo See INSTALLATION.md for detailed instructions.
echo.
pause
