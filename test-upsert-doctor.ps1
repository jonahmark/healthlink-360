# Log in as doctor and get JWT token
$loginBody = @{ email = "doctor@example.com"; password = "password123" } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.token
Write-Host "Doctor JWT Token: $token"

# Prepare upsert doctor profile body
$profileBody = @{
  name = "Dr. Test"
  specialty = "General"
  bio = "Test bio"
  experience_years = 5
  education = "MBBS"
  certifications = "Board Certified"
  consultation_fee = 100
  available_days = "Mon,Tue"
  available_hours = "9-5"
} | ConvertTo-Json

# Call upsert doctor profile endpoint
$response2 = Invoke-RestMethod -Uri "http://localhost:5000/api/doctors" -Method Post -Body $profileBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
Write-Host "Upsert Doctor Profile Response:"
$response2 