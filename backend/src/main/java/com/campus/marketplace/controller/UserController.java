package com.campus.marketplace.controller;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.User;
import com.campus.marketplace.exception.ResourceNotFoundException;
import com.campus.marketplace.repository.UserRepository;
import com.campus.marketplace.service.AuthService;
import com.campus.marketplace.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final FileUploadUtil fileUploadUtil;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.mapToUserResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal User user) {
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getYear() != null) user.setYear(request.getYear());
        user = userRepository.save(user);
        return ResponseEntity.ok(authService.mapToUserResponse(user));
    }

    @PostMapping(value = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateProfileImage(
            @RequestPart("image") MultipartFile image,
            @AuthenticationPrincipal User user) {
        if (user.getProfileImage() != null) {
            fileUploadUtil.deleteFile(user.getProfileImage());
        }
        String filename = fileUploadUtil.uploadFile(image);
        user.setProfileImage(filename);
        user = userRepository.save(user);
        return ResponseEntity.ok(authService.mapToUserResponse(user));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(authService.mapToUserResponse(user));
    }
}
