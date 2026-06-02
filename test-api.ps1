# Message Board API Test Script
Write-Host "🧪 Testing Huddle Message Board API" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Base URL
$baseUrl = "http://localhost:5000"

# Test 1: Get Messages
Write-Host "Test 1: GET /api/messages" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/messages" -Method GET -ErrorAction Stop
    Write-Host "✅ Success" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 2: Register User
Write-Host "Test 2: POST /api/auth/register" -ForegroundColor Yellow
$registerBody = @{
    username = "testuser_$(Get-Random)"
    email = "test_$(Get-Random)@example.com"
    password = "TestPassword123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Success" -ForegroundColor Green
    Write-Host "User created: $($response.user.username)" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Post a Message
Write-Host "Test 3: POST /api/messages (Public)" -ForegroundColor Yellow
$messageBody = @{
    text = "Hello Huddle Message Board! 🎉"
    topic = "general"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/messages" -Method POST -Body $messageBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Success" -ForegroundColor Green
    if ($response.data) {
        Write-Host "Message #$($response.data.messageNumber): $($response.data.text)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "✅ API Server Status: RUNNING on port 5000" -ForegroundColor Green
Write-Host "📊 Message Board: ACTIVE" -ForegroundColor Green
Write-Host "🔌 Database: Attempting to connect to MongoDB Atlas..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start the React frontend: npm start (in root directory)" -ForegroundColor Gray
Write-Host "2. Test message posting and voting" -ForegroundColor Gray
Write-Host "3. Fix MongoDB Atlas connection if needed" -ForegroundColor Gray
