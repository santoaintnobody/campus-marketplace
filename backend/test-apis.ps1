$loginBody = '{"email":"rahul@college.edu","password":"student123"}'
$res = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "Login response:"
$res | ConvertTo-Json -Depth 3

$token = $res.token
Write-Host "`nToken received: $token"

# Test Wishlist Count
$headers = @{ "Authorization" = "Bearer $token" }
$wishlistCount = Invoke-RestMethod -Uri "http://localhost:8080/api/wishlist/count" -Method Get -Headers $headers
Write-Host "`nWishlist Count:" ($wishlistCount | ConvertTo-Json)

# Test Notifications unread count
$notifCount = Invoke-RestMethod -Uri "http://localhost:8080/api/notifications/unread-count" -Method Get -Headers $headers
Write-Host "`nUnread Notifications Count:" ($notifCount | ConvertTo-Json)

# Test Unread Messages count
$msgCount = Invoke-RestMethod -Uri "http://localhost:8080/api/messages/unread-count" -Method Get -Headers $headers
Write-Host "`nUnread Messages Count:" ($msgCount | ConvertTo-Json)

# Test Products list
$products = Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Get
Write-Host "`nTotal Products returned:" $products.totalElements
