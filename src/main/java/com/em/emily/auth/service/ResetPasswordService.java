package com.em.emily.auth.service;

import com.em.emily.auth.entity.ResetPasswordToken;
import com.em.emily.auth.entity.User;
import com.em.emily.auth.repository.ResetPasswordTokenRepository;
import com.em.emily.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResetPasswordService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TotpService totpService;

    @Transactional
    public void sendResetCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Ensure user has a TOTP secret
        if (user.getTotpSecret() == null || user.getTotpSecret().isEmpty()) {
            user.setTotpSecret(totpService.generateSecret());
            userRepository.save(user);
        }

        // 2. Generate a 6-digit TOTP code
        String code = totpService.generateCode(user.getTotpSecret());

        // 3. No need to save to a separate token table (RFC 6238 is time-derived)
        // However, we could still use a 'used' flag if we want strictly one-time use
        // but for now, we'll go with pure TOTP.

        // 4. Send the email
        String subject = "Your Password Reset Code";
        String body = """
                Hello,
                
                You requested a password reset. Please use the following 6-digit code to update your password:
                
                %s
                
                This code will expire in 10 minutes. If you did not request this, please ignore this email.
                """.formatted(code);

        emailService.sendEmail(email, subject, body);
        log.info("Reset code sent successfully to: {}", email);
    }

    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        // 1. Find the user by email first
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid code or email address"));

        // 2. Verify the code using TotpService
        boolean isValid = totpService.verifyCode(user.getTotpSecret(), code, 600);

        if (!isValid) {
            throw new RuntimeException("Invalid or expired code.");
        }

        // 4. Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}