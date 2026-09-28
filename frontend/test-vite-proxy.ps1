$loginBody = '{"email":"rahul@college.edu","password":"student123"}'
$res = Invoke-RestMethod -Uri "http://localhost:5173/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $res.token
$headers = @{ "Authorization" = "Bearer $token" }

$wish = Invoke-RestMethod -Uri "http://localhost:5173/api/wishlist/count" -Method Get -Headers $headers
$notif = Invoke-RestMethod -Uri "http://localhost:5173/api/notifications/unread-count" -Method Get -Headers $headers
$msg = Invoke-RestMethod -Uri "http://localhost:5173/api/messages/unread-count" -Method Get -Headers $headers

Write-Host "Vite Proxy Test -> Wishlist Count:" $wish.count ", Notifications:" $notif.count ", Messages:" $msg.count
