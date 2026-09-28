package com.campus.marketplace.service;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.User;
import com.campus.marketplace.entity.enums.NotificationType;
import com.campus.marketplace.entity.enums.Role;
import com.campus.marketplace.exception.*;
import com.campus.marketplace.repository.ListingRepository;
import com.campus.marketplace.repository.UserRepository;
import com.campus.marketplace.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;

    @Value("${app.college.email-domain}")
    private String collegeEmailDomain;

    @Value("${app.mail.enabled}")
    private boolean mailEnabled;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Validate college email
        if (!request.getEmail().endsWith(collegeEmailDomain)) {
            throw new BadRequestException("Only college email addresses (" + collegeEmailDomain + ") are allowed");
        }

        // Check duplicates
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (userRepository.existsByStudentId(request.getStudentId())) {
            throw new DuplicateResourceException("Student ID already registered");
        }

        // Create user
        String verificationToken = UUID.randomUUID().toString();
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .studentId(request.getStudentId())
                .department(request.getDepartment())
                .year(request.getYear())
                .role(Role.STUDENT)
                .emailVerified(!mailEnabled) // Auto-verify if mail is disabled
                .accountActive(true)
                .rating(0.0)
                .ratingCount(0)
                .emailVerificationToken(verificationToken)
                .emailVerificationTokenExpiry(LocalDateTime.now().plusHours(24))
                .build();

        user = userRepository.save(user);

        if (!mailEnabled) {
            System.out.println("========================================");
            System.out.println("DEV MODE: Email verification link for " + user.getEmail());
            System.out.println("Token: " + verificationToken);
            System.out.println("URL: http://localhost:5173/verify-email?token=" + verificationToken);
            System.out.println("========================================");
        }

        // Send welcome notification
        notificationService.createNotification(user, NotificationType.EMAIL_VERIFICATION,
                "Welcome to Campus Marketplace!",
                "Your account has been created successfully. Start browsing and listing items!");

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isAccountActive()) {
            throw new ForbiddenException("Your account has been blocked. Please contact admin.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public ApiResponse verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);

        return ApiResponse.success("Email verified successfully");
    }

    @Transactional
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email"));

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Log the reset link for dev mode
        System.out.println("========================================");
        System.out.println("Password reset link for " + user.getEmail());
        System.out.println("Token: " + resetToken);
        System.out.println("URL: http://localhost:5173/reset-password?token=" + resetToken);
        System.out.println("========================================");

        notificationService.createNotification(user, NotificationType.PASSWORD_RESET,
                "Password Reset Requested",
                "A password reset has been requested for your account.");

        return ApiResponse.success("Password reset link has been sent to your email");
    }

    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        return ApiResponse.success("Password reset successfully");
    }

    public UserResponse mapToUserResponse(User user) {
        long listingCount = listingRepository.countBySeller(user);
        long soldCount = listingRepository.countBySellerAndStatus(user,
                com.campus.marketplace.entity.enums.ListingStatus.SOLD);

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .year(user.getYear())
                .studentId(user.getStudentId())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .accountActive(user.isAccountActive())
                .rating(user.getRating())
                .ratingCount(user.getRatingCount())
                .listingCount(listingCount)
                .soldCount(soldCount)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
