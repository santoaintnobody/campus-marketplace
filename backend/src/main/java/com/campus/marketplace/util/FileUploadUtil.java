package com.campus.marketplace.util;

import com.campus.marketplace.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class FileUploadUtil {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/jpg"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @PostConstruct
    public void init() {
        try {
            Path path = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String uploadFile(MultipartFile file) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = UUID.randomUUID().toString() + extension;

        try {
            Path targetPath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    public void deleteFile(String filename) {
        try {
            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't throw
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum allowed size (5MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Only JPEG, PNG, and WEBP are allowed");
        }
    }
}
