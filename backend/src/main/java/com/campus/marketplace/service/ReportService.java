package com.campus.marketplace.service;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.*;
import com.campus.marketplace.entity.enums.*;
import com.campus.marketplace.exception.*;
import com.campus.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public ApiResponse createReport(ReportRequest request, User reporter) {
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        User reportedUser = null;
        if (request.getReportedUserId() != null) {
            reportedUser = userRepository.findById(request.getReportedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reported user not found"));
        } else {
            reportedUser = listing.getSeller();
        }

        Report report = Report.builder()
                .reporter(reporter)
                .listing(listing)
                .reportedUser(reportedUser)
                .reason(request.getReason())
                .description(request.getDescription())
                .status(ReportStatus.PENDING)
                .build();

        reportRepository.save(report);

        return ApiResponse.success("Report submitted successfully. Our team will review it.");
    }

    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReportResponse> getPendingReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportResponse resolveReport(Long reportId, String adminNotes) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        report.setStatus(ReportStatus.RESOLVED);
        report.setAdminNotes(adminNotes);
        reportRepository.save(report);

        notificationService.createNotification(report.getReporter(), NotificationType.LISTING_REPORTED,
                "Report Resolved", "Your report has been reviewed and resolved by admin.", report.getListing().getId());

        return mapToResponse(report);
    }

    @Transactional
    public ReportResponse rejectReport(Long reportId, String adminNotes) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        report.setStatus(ReportStatus.REJECTED);
        report.setAdminNotes(adminNotes);
        reportRepository.save(report);

        return mapToResponse(report);
    }

    private ReportResponse mapToResponse(Report r) {
        return ReportResponse.builder()
                .id(r.getId())
                .reporterId(r.getReporter().getId())
                .reporterName(r.getReporter().getFullName())
                .listingId(r.getListing() != null ? r.getListing().getId() : null)
                .listingTitle(r.getListing() != null ? r.getListing().getTitle() : null)
                .reportedUserId(r.getReportedUser() != null ? r.getReportedUser().getId() : null)
                .reportedUserName(r.getReportedUser() != null ? r.getReportedUser().getFullName() : null)
                .reason(r.getReason())
                .description(r.getDescription())
                .status(r.getStatus())
                .adminNotes(r.getAdminNotes())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
