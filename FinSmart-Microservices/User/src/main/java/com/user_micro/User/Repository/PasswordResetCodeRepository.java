package com.user_micro.User.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.user_micro.User.Model.PasswordResetCode;

import java.util.Optional;

@Repository
public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {
    Optional<PasswordResetCode> findByEmailAndCodeAndUsedFalse(String email, String code);
    Optional<PasswordResetCode> findTopByEmailOrderByCreatedAtDesc(String email);
}

