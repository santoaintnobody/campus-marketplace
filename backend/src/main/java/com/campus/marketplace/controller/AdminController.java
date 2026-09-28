package com.campus.marketplace.controller;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.service.AdminService;
import com.campus.marketplace.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(adminService.searchUsers(search));
        }
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse> blockUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.blockUser(id));
    }

    @PatchMapping("/users/{id}/unblock")
    public ResponseEntity<ApiResponse> unblockUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.unblockUser(id));
    }

    @GetMapping("/listings/pending")
    public ResponseEntity<List<ListingResponse>> getPendingListings() {
        return ResponseEntity.ok(adminService.getPendingListings());
    }

    @PatchMapping("/listings/{id}/approve")
    public ResponseEntity<ListingResponse> approveListing(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveListing(id));
    }

    @PatchMapping("/listings/{id}/reject")
    public ResponseEntity<ListingResponse> rejectListing(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectListing(id));
    }

    @DeleteMapping("/listings/{id}")
    public ResponseEntity<ApiResponse> removeListing(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.removeListing(id));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ReportResponse>> getReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(@PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("adminNotes") : null;
        return ResponseEntity.ok(reportService.resolveReport(id, notes));
    }

    @PatchMapping("/reports/{id}/reject")
    public ResponseEntity<ReportResponse> rejectReport(@PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("adminNotes") : null;
        return ResponseEntity.ok(reportService.rejectReport(id, notes));
    }
}
