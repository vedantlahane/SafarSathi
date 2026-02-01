Write-Host "Testing SafarSathi APIs..." -ForegroundColor Cyan
Write-Host ""

# 1. Test Login
Write-Host "1. Testing Login API..." -ForegroundColor Yellow
try {
    $loginBody = '{"email":"tourist@safarsathi.in","password":"password123"}'
    $login = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    Write-Host "   Tourist ID: $($login.touristId)"
    Write-Host "   Name: $($login.user.name)"
    $touristId = $login.touristId
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Test Get Profile
Write-Host "2. Testing Profile API..." -ForegroundColor Yellow
try {
    $profile = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/profile/$touristId" -Method GET
    Write-Host "   ✅ Profile retrieved!" -ForegroundColor Green
    Write-Host "   Email: $($profile.email)"
    Write-Host "   Phone: $($profile.phone)"
} catch {
    Write-Host "   ❌ Profile failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Test Dashboard (correct path: /api/tourist/:id/dashboard)
Write-Host "3. Testing Tourist Dashboard API..." -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "http://localhost:8081/api/tourist/$touristId/dashboard" -Method GET
    Write-Host "   ✅ Dashboard retrieved!" -ForegroundColor Green
    Write-Host "   Safety Score: $($dashboard.safetyScore)"
    Write-Host "   Status: $($dashboard.status)"
    Write-Host "   Open Alerts: $($dashboard.openAlerts)"
} catch {
    Write-Host "   ❌ Dashboard failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Test Risk Zones (correct path: /api/risk-zones/active)
Write-Host "4. Testing Risk Zones API..." -ForegroundColor Yellow
try {
    $zones = Invoke-RestMethod -Uri "http://localhost:8081/api/risk-zones/active" -Method GET
    Write-Host "   ✅ Risk Zones retrieved!" -ForegroundColor Green
    Write-Host "   Total Zones: $($zones.Count)"
    foreach ($zone in $zones) {
        Write-Host "   - $($zone.name) [$($zone.riskLevel)]"
    }
} catch {
    Write-Host "   ❌ Risk Zones failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Test Police Departments
Write-Host "5. Testing Police Departments API..." -ForegroundColor Yellow
try {
    $police = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/police" -Method GET
    Write-Host "   ✅ Police Departments retrieved!" -ForegroundColor Green
    Write-Host "   Total Departments: $($police.Count)"
    foreach ($dept in $police) {
        Write-Host "   - $($dept.name) ($($dept.city))"
    }
} catch {
    Write-Host "   ❌ Police Departments failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 6. Test Admin Login
Write-Host "6. Testing Admin Login API..." -ForegroundColor Yellow
try {
    $adminBody = '{"email":"admin@safarsathi.in","password":"admin123"}'
    $adminLogin = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/login" -Method POST -ContentType "application/json" -Body $adminBody
    Write-Host "   ✅ Admin Login successful!" -ForegroundColor Green
    Write-Host "   Admin: $($adminLogin.admin.name)"
    Write-Host "   Department: $($adminLogin.admin.departmentCode)"
} catch {
    Write-Host "   ❌ Admin Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 7. Test Admin Dashboard (correct path: /api/admin/dashboard/state)
Write-Host "7. Testing Admin Dashboard API..." -ForegroundColor Yellow
try {
    $adminDash = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/dashboard/state" -Method GET
    Write-Host "   ✅ Admin Dashboard retrieved!" -ForegroundColor Green
    Write-Host "   Total Tourists: $($adminDash.stats.totalTourists)"
    Write-Host "   Active Alerts: $($adminDash.stats.activeAlerts)"
    Write-Host "   Response Units: $($adminDash.responseUnits.Count)"
} catch {
    Write-Host "   ❌ Admin Dashboard failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 8. Test Location Update (correct path: /api/action/location/:id)
Write-Host "8. Testing Location Update API..." -ForegroundColor Yellow
try {
    $locBody = '{"lat":26.1445,"lng":91.7362,"accuracy":10}'
    Invoke-RestMethod -Uri "http://localhost:8081/api/action/location/$touristId" -Method POST -ContentType "application/json" -Body $locBody
    Write-Host "   ✅ Location updated!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Location Update failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 9. Test SOS
Write-Host "9. Testing SOS API..." -ForegroundColor Yellow
try {
    $sosBody = '{"lat":26.1445,"lng":91.7362}'
    $sos = Invoke-RestMethod -Uri "http://localhost:8081/api/action/sos/$touristId" -Method POST -ContentType "application/json" -Body $sosBody
    Write-Host "   ✅ SOS triggered!" -ForegroundColor Green
    Write-Host "   Status: $($sos.status)"
} catch {
    Write-Host "   ❌ SOS failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 10. Test Alerts
Write-Host "10. Testing Alerts API..." -ForegroundColor Yellow
try {
    $alerts = Invoke-RestMethod -Uri "http://localhost:8081/api/admin/alerts" -Method GET
    Write-Host "   ✅ Alerts retrieved!" -ForegroundColor Green
    Write-Host "   Total Active Alerts: $($alerts.Count)"
} catch {
    Write-Host "   ❌ Alerts failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All API tests completed!" -ForegroundColor Cyan
