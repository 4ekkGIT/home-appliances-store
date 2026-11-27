package com.nexora.backend.service;

import com.nexora.backend.entity.EmailVerificationToken;
import com.nexora.backend.entity.StoreUser;
import com.nexora.backend.repository.EmailVerificationTokenRepository;
import com.nexora.backend.repository.StoreUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Locale;

@Service
public class EmailVerificationService {
    private static final Logger logger = LoggerFactory.getLogger(EmailVerificationService.class);

    private final EmailVerificationTokenRepository tokenRepository;
    private final StoreUserRepository userRepository;
    private final JavaMailSender mailSender;
    private final String verificationBaseUrl;
    private final String fromAddress;
    private final long tokenValidityHours;
    private final SecureRandom secureRandom = new SecureRandom();

    public EmailVerificationService(EmailVerificationTokenRepository tokenRepository,
                                    StoreUserRepository userRepository,
                                    JavaMailSender mailSender,
                                    @Value("${app.email-verification.base-url:http://localhost:5173/verify-email}") String verificationBaseUrl,
                                    @Value("${app.email-verification.from:no-reply@nexora.local}") String fromAddress,
                                    @Value("${app.email-verification.token-validity-hours:24}") long tokenValidityHours) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.verificationBaseUrl = verificationBaseUrl;
        this.fromAddress = fromAddress;
        this.tokenValidityHours = tokenValidityHours;
    }

    @Transactional
    public void issueToken(StoreUser user) {
        if (user.isEmailVerified()) {
            return;
        }
        String rawToken = generateRawToken();
        String tokenHash = hashToken(rawToken);
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        tokenRepository.invalidateUnusedForUser(user, now);
        tokenRepository.save(new EmailVerificationToken(
                user, tokenHash, now.plusHours(tokenValidityHours)));
        sendVerificationEmail(user.getEmail(), rawToken);
    }

    @Transactional
    public void confirm(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token is required");
        }
        EmailVerificationToken token = tokenRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification token"));
        if (token.getUsedAt() != null) {
            throw new ResponseStatusException(HttpStatus.GONE, "Verification token has already been used");
        }
        if (token.getExpiresAt().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token has expired");
        }
        token.markUsed();
        token.getUser().verifyEmail();
    }

    @Transactional
    public void resend(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (!normalizedEmail.isBlank()) {
            userRepository.findByEmailIgnoreCase(normalizedEmail)
                    .filter(user -> user.getRole() == StoreUser.Role.CUSTOMER)
                    .filter(user -> !user.isEmailVerified())
                    .ifPresent(this::issueToken);
        }
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder encoded = new StringBuilder(hash.length * 2);
            for (byte value : hash) {
                encoded.append(String.format("%02x", Byte.toUnsignedInt(value)));
            }
            return encoded.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private void sendVerificationEmail(String email, String rawToken) {
        String separator = verificationBaseUrl.contains("?") ? "&" : "?";
        String link = verificationBaseUrl + separator + "token=" + rawToken;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email);
        message.setSubject("Confirm your Nexora email address");
        message.setText("Confirm your email address by opening this link:\n" + link
                + "\n\nThis link expires in " + tokenValidityHours + " hours.");
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            logger.error("Failed to send email verification message", exception);
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not send verification email. Please try again later.",
                    exception);
        }
    }
}
