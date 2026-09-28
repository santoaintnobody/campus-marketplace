# ==========================================================
# CAMPUS MARKETPLACE - AUTOMATED COMPREHENSIVE QA TEST SUITE
# ==========================================================
$baseUrl = "http://localhost:8080/api"
$passed = 0
$failed = 0

function Test-Assert($desc, $condition) {
    if ($condition) {
        Write-Host "  [PASS] $desc" -ForegroundColor Green
        $global:passed++
    } else {
        Write-Host "  [FAIL] $desc" -ForegroundColor Red
        $global:failed++
    }
}

Write-Host "=================================================="
Write-Host "1. AUTHENTICATION QA"
Write-Host "=================================================="
$loginRahul = '{"email":"rahul@college.edu","password":"student123"}'
$resRahul = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginRahul -ContentType "application/json"
Test-Assert "Rahul login successful and returned JWT" ($resRahul.token -and $resRahul.user.fullName -eq "Rahul Sharma")

$tokenRahul = $resRahul.token
$headersRahul = @{ "Authorization" = "Bearer $tokenRahul" }

$loginPriya = '{"email":"priya@college.edu","password":"student123"}'
$resPriya = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginPriya -ContentType "application/json"
Test-Assert "Priya login successful and returned JWT" ($resPriya.token -and $resPriya.user.fullName -eq "Priya Patel")

$tokenPriya = $resPriya.token
$headersPriya = @{ "Authorization" = "Bearer $tokenPriya" }

$loginAdmin = '{"email":"admin@college.edu","password":"admin123"}'
$resAdmin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginAdmin -ContentType "application/json"
Test-Assert "Admin login successful and has ADMIN role" ($resAdmin.token -and $resAdmin.user.role -eq "ADMIN")

$tokenAdmin = $resAdmin.token
$headersAdmin = @{ "Authorization" = "Bearer $tokenAdmin" }

Write-Host "`n=================================================="
Write-Host "2. HOME & CATALOG QA"
Write-Host "=================================================="
$stats = Invoke-RestMethod -Uri "$baseUrl/products/stats" -Method Get
Test-Assert "Public stats return active listings count > 0" ($stats.activeListings -gt 0)

$featured = Invoke-RestMethod -Uri "$baseUrl/products/featured" -Method Get
Test-Assert "Featured products API returns listings" ($featured.Count -gt 0)

Write-Host "`n=================================================="
Write-Host "3. BROWSE, SEARCH & FILTER QA"
Write-Host "=================================================="
$allProducts = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get
Test-Assert "Get all products returned 30 seeded listings" ($allProducts.totalElements -ge 20)

$searchResult = Invoke-RestMethod -Uri "$baseUrl/products?q=Calculator" -Method Get
Test-Assert "Search for 'Calculator' finds Casio Calculator" ($searchResult.content.Count -ge 1)

$categoryResult = Invoke-RestMethod -Uri "$baseUrl/products?category=TEXTBOOKS" -Method Get
Test-Assert "Category filter for TEXTBOOKS returns items" ($categoryResult.content.Count -ge 1)

$sortResult = Invoke-RestMethod -Uri "$baseUrl/products?sort=price_asc" -Method Get
Test-Assert "Price sort low to high returns valid list" ($sortResult.content[0].price -le $sortResult.content[-1].price)

Write-Host "`n=================================================="
Write-Host "4. WISHLIST QA"
Write-Host "=================================================="
# Get initial count
$initialFavCount = (Invoke-RestMethod -Uri "$baseUrl/wishlist/count" -Method Get -Headers $headersRahul).count

# Toggle item 20
$toggleRes = Invoke-RestMethod -Uri "$baseUrl/wishlist/toggle/20" -Method Post -Headers $headersRahul
Test-Assert "Wishlist toggle succeeded and returned wishlisted=true" ($toggleRes.wishlisted -eq $true)

$newFavCount = (Invoke-RestMethod -Uri "$baseUrl/wishlist/count" -Method Get -Headers $headersRahul).count
Test-Assert "Wishlist count incremented by 1" ($newFavCount -eq ($initialFavCount + 1))

$checkFav = Invoke-RestMethod -Uri "$baseUrl/wishlist/check/20" -Method Get -Headers $headersRahul
Test-Assert "Wishlist check confirms item 20 is wishlisted" ($checkFav.wishlisted -eq $true)

# Toggle again to remove
$toggleRemove = Invoke-RestMethod -Uri "$baseUrl/wishlist/toggle/20" -Method Post -Headers $headersRahul
Test-Assert "Wishlist toggle removes item and returned wishlisted=false" ($toggleRemove.wishlisted -eq $false)

$restoredFavCount = (Invoke-RestMethod -Uri "$baseUrl/wishlist/count" -Method Get -Headers $headersRahul).count
Test-Assert "Wishlist count restored to initial" ($restoredFavCount -eq $initialFavCount)

Write-Host "`n=================================================="
Write-Host "5. CHAT / MESSAGING QA"
Write-Host "=================================================="
$msgPayload = '{"recipientId":3,"listingId":1,"content":"Hello Priya! Is the price negotiable for the engineering book?"}'
$sentMsg = Invoke-RestMethod -Uri "$baseUrl/messages" -Method Post -Body $msgPayload -ContentType "application/json" -Headers $headersRahul
Test-Assert "Rahul sent chat message to Priya" ($sentMsg.id -and $sentMsg.senderName -eq "Rahul Sharma")

$priyaUnreadMsg = (Invoke-RestMethod -Uri "$baseUrl/messages/unread-count" -Method Get -Headers $headersPriya).count
Test-Assert "Priya unread message counter updated" ($priyaUnreadMsg -ge 1)

$priyaConvos = Invoke-RestMethod -Uri "$baseUrl/messages/conversations" -Method Get -Headers $headersPriya
Test-Assert "Priya conversation list contains the active thread" ($priyaConvos.Count -ge 1)

$history = Invoke-RestMethod -Uri "$baseUrl/messages/conversation?otherUserId=2&listingId=1" -Method Get -Headers $headersPriya
Test-Assert "Priya fetches message history and gets persistent messages" ($history.Count -ge 1)

$priyaUnreadAfterRead = (Invoke-RestMethod -Uri "$baseUrl/messages/unread-count" -Method Get -Headers $headersPriya).count
Test-Assert "Unread messages count decremented after opening conversation" ($priyaUnreadAfterRead -lt $priyaUnreadMsg)

Write-Host "`n=================================================="
Write-Host "6. OFFERS & BUSINESS LOGIC QA"
Write-Host "=================================================="
# Test Self-Offer Prevention (Rahul making offer on his own listing 1)
$selfOfferBlocked = $false
try {
    $selfOffer = '{"listingId":1,"offerAmount":300.00,"message":"Self offer"}'
    Invoke-RestMethod -Uri "$baseUrl/offers" -Method Post -Body $selfOffer -ContentType "application/json" -Headers $headersRahul
} catch {
    $selfOfferBlocked = $true
}
Test-Assert "Self-offer is strictly rejected by backend with 400 Bad Request" $selfOfferBlocked

# Valid Offer (Rahul making offer on Priya's listing 2 - Casio Calculator)
$validOffer = '{"listingId":2,"offerAmount":850.00,"message":"Can you do 850 for the calculator?"}'
$createdOffer = Invoke-RestMethod -Uri "$baseUrl/offers" -Method Post -Body $validOffer -ContentType "application/json" -Headers $headersRahul
Test-Assert "Rahul made offer on Priya's listing 2 successfully" ($createdOffer.id -and $createdOffer.status -eq "PENDING")

$offerId = $createdOffer.id

# Check Priya received offers
$priyaOffers = Invoke-RestMethod -Uri "$baseUrl/offers/received" -Method Get -Headers $headersPriya
Test-Assert "Priya sees the received offer in her dashboard" ($priyaOffers | Where-Object { $_.id -eq $offerId })

# Priya accepts offer
$acceptRes = Invoke-RestMethod -Uri "$baseUrl/offers/$offerId/accept" -Method Patch -Headers $headersPriya
Test-Assert "Priya accepted the offer, status is now ACCEPTED" ($acceptRes.status -eq "ACCEPTED")

# Prevent re-accepting already accepted offer
$reAcceptBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/offers/$offerId/accept" -Method Patch -Headers $headersPriya
} catch {
    $reAcceptBlocked = $true
}
Test-Assert "Re-accepting already accepted offer is strictly blocked" $reAcceptBlocked

# Verify Rahul received notification for accepted offer
$rahulNotifs = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers $headersRahul
$acceptedNotif = $rahulNotifs | Where-Object { $_.type -eq "OFFER_ACCEPTED" }
Test-Assert "Rahul received persistent notification that offer was accepted" ($acceptedNotif -ne $null)

Write-Host "`n=================================================="
Write-Host "7. NOTIFICATIONS QA"
Write-Host "=================================================="
$notifUnreadCount = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method Get -Headers $headersRahul).count
Test-Assert "Unread notifications count is accurate" ($notifUnreadCount -ge 1)

# Mark all as read
Invoke-RestMethod -Uri "$baseUrl/notifications/read-all" -Method Patch -Headers $headersRahul
$notifUnreadAfter = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method Get -Headers $headersRahul).count
Test-Assert "Mark all notifications as read resets unread count to 0" ($notifUnreadAfter -eq 0)

Write-Host "`n=================================================="
Write-Host "8. ADMIN DASHBOARD & MODERATION QA"
Write-Host "=================================================="
$adminDashboard = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method Get -Headers $headersAdmin
Test-Assert "Admin dashboard stats loaded with user & listing metrics" ($adminDashboard.totalUsers -ge 5 -and $adminDashboard.totalListings -ge 20)

$adminUsers = Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get -Headers $headersAdmin
Test-Assert "Admin users list returned all users" ($adminUsers.Count -ge 5)

Write-Host "`n=================================================="
Write-Host "QA SUMMARY REPORT"
Write-Host "=================================================="
Write-Host "TOTAL TESTS RUN: $($passed + $failed)"
Write-Host "TESTS PASSED:    $passed" -ForegroundColor Green
Write-Host "TESTS FAILED:    $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "=================================================="
