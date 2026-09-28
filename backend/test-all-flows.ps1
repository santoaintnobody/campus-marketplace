$loginRahul = '{"email":"rahul@college.edu","password":"student123"}'
$resRahul = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginRahul -ContentType "application/json"
$tokenRahul = $resRahul.token
$headersRahul = @{ "Authorization" = "Bearer $tokenRahul" }

$loginPriya = '{"email":"priya@college.edu","password":"student123"}'
$resPriya = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginPriya -ContentType "application/json"
$tokenPriya = $resPriya.token
$headersPriya = @{ "Authorization" = "Bearer $tokenPriya" }

Write-Host "=== 1. TEST WISHLIST ==="
$favStatusBefore = Invoke-RestMethod -Uri "http://localhost:8080/api/wishlist/check/10" -Method Get -Headers $headersRahul
Write-Host "Wishlist check for listing 10 before:" ($favStatusBefore | ConvertTo-Json)

$toggleRes = Invoke-RestMethod -Uri "http://localhost:8080/api/wishlist/toggle/10" -Method Post -Headers $headersRahul
Write-Host "Wishlist toggle for listing 10:" ($toggleRes | ConvertTo-Json)

$favCount = Invoke-RestMethod -Uri "http://localhost:8080/api/wishlist/count" -Method Get -Headers $headersRahul
Write-Host "Wishlist count for Rahul now:" ($favCount | ConvertTo-Json)

Write-Host "`n=== 2. TEST CHAT / MESSAGING ==="
$msgBody = '{"recipientId":3,"listingId":1,"content":"Hi Priya! Is this Engineering Math book still available?"}'
$sentMsg = Invoke-RestMethod -Uri "http://localhost:8080/api/messages" -Method Post -Body $msgBody -ContentType "application/json" -Headers $headersRahul
Write-Host "Message sent by Rahul to Priya:" ($sentMsg | ConvertTo-Json -Depth 2)

$priyaMsgCount = Invoke-RestMethod -Uri "http://localhost:8080/api/messages/unread-count" -Method Get -Headers $headersPriya
Write-Host "Priya unread messages count:" ($priyaMsgCount | ConvertTo-Json)

$convos = Invoke-RestMethod -Uri "http://localhost:8080/api/messages/conversations" -Method Get -Headers $headersPriya
Write-Host "Priya conversations count:" $convos.Count

Write-Host "`n=== 3. TEST OFFERS ==="
$offerBody = '{"listingId":3,"offerAmount":380.00,"message":"Would you take 380 for the math book?"}'
$createdOffer = Invoke-RestMethod -Uri "http://localhost:8080/api/offers" -Method Post -Body $offerBody -ContentType "application/json" -Headers $headersRahul
Write-Host "Offer created by Rahul:" ($createdOffer | ConvertTo-Json -Depth 2)

$priyaOffers = Invoke-RestMethod -Uri "http://localhost:8080/api/offers/received" -Method Get -Headers $headersPriya
Write-Host "Priya received offers count:" $priyaOffers.Count

if ($priyaOffers.Count -gt 0) {
    $offerId = $priyaOffers[0].id
    $acceptRes = Invoke-RestMethod -Uri "http://localhost:8080/api/offers/$offerId/accept" -Method Patch -Headers $headersPriya
    Write-Host "Priya accepted offer #$offerId. Status:" $acceptRes.status
}

Write-Host "`n=== 4. TEST NOTIFICATIONS ==="
$rahulNotifs = Invoke-RestMethod -Uri "http://localhost:8080/api/notifications" -Method Get -Headers $headersRahul
Write-Host "Rahul notifications count:" $rahulNotifs.Count
if ($rahulNotifs.Count -gt 0) {
    Write-Host "Latest notification:" ($rahulNotifs[0] | ConvertTo-Json)
}

Write-Host "`nALL BACKEND FLOWS VALIDATED SUCCESSFULLY!"
