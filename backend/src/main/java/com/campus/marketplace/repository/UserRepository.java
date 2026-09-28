package com.campus.marketplace.repository;

import com.campus.marketplace.entity.User;
import com.campus.marketplace.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByStudentId(String studentId);
    Optional<User> findByEmailVerificationToken(String token);
    Optional<User> findByPasswordResetToken(String token);
    List<User> findByRole(Role role);
    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
    long countByRole(Role role);
    long countByAccountActive(boolean active);
}
