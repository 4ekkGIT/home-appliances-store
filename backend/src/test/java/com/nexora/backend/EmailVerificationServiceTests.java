package com.nexora.backend;

import com.nexora.backend.entity.EmailVerificationToken;
import com.nexora.backend.entity.StoreUser;
import com.nexora.backend.repository.EmailVerificationTokenRepository;
import com.nexora.backend.repository.StoreUserRepository;
import com.nexora.backend.service.EmailVerificationService;
import com.nexora.backend.service.StoreUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmailVerificationServiceTests {
    @Test
    void unverifiedCustomerCannotBeLoadedAsEnabledUser() {
        StoreUserRepository users = mock(StoreUserRepository.class);
        StoreUser customer = new StoreUser("Test", null, "test@example.com",
                "hash", null, StoreUser.Role.CUSTOMER);
        when(users.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(customer));

        var details = new StoreUserDetailsService(users).loadUserByUsername("test@example.com");

        assertFalse(details.isEnabled());
    }

    @Test
    void verifiedCustomerCanBeLoadedAsEnabledUser() {
        StoreUserRepository users = mock(StoreUserRepository.class);
        StoreUser customer = new StoreUser("Test", null, "test@example.com",
                "hash", null, StoreUser.Role.CUSTOMER);
        customer.verifyEmail();
        when(users.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(customer));

        var details = new StoreUserDetailsService(users).loadUserByUsername("test@example.com");

        assertTrue(details.isEnabled());
    }

    @Test
    void expiredTokenIsRejected() {
        EmailVerificationTokenRepository tokens = mock(EmailVerificationTokenRepository.class);
        StoreUserRepository users = mock(StoreUserRepository.class);
        JavaMailSender mail = mock(JavaMailSender.class);
        StoreUser customer = new StoreUser("Test", null, "test@example.com",
                "hash", null, StoreUser.Role.CUSTOMER);
        EmailVerificationToken token = new EmailVerificationToken(
                customer, "unused-in-this-test",
                OffsetDateTime.now(ZoneOffset.UTC).minusMinutes(1));
        when(tokens.findByTokenHash(any())).thenReturn(Optional.of(token));
        EmailVerificationService service = new EmailVerificationService(
                tokens, users, mail, "http://localhost:5173/verify-email", "no-reply@example.com", 24);

        assertThrows(ResponseStatusException.class, () -> service.confirm("raw-token"));
    }

    @Test
    void usedTokenIsRejectedAgain() {
        EmailVerificationTokenRepository tokens = mock(EmailVerificationTokenRepository.class);
        StoreUserRepository users = mock(StoreUserRepository.class);
        JavaMailSender mail = mock(JavaMailSender.class);
        StoreUser customer = new StoreUser("Test", null, "test@example.com",
                "hash", null, StoreUser.Role.CUSTOMER);
        EmailVerificationToken token = new EmailVerificationToken(
                customer, "unused-in-this-test",
                OffsetDateTime.now(ZoneOffset.UTC).plusHours(1));
        token.markUsed();
        when(tokens.findByTokenHash(any())).thenReturn(Optional.of(token));
        EmailVerificationService service = new EmailVerificationService(
                tokens, users, mail, "http://localhost:5173/verify-email", "no-reply@example.com", 24);

        assertThrows(ResponseStatusException.class, () -> service.confirm("raw-token"));
    }

    @Test
    void issuesConfirmationEmailAndSurfacesDeliveryFailure() {
        EmailVerificationTokenRepository tokens = mock(EmailVerificationTokenRepository.class);
        StoreUserRepository users = mock(StoreUserRepository.class);
        JavaMailSender mail = mock(JavaMailSender.class);
        StoreUser customer = new StoreUser("Test", null, "test@example.com",
                "hash", null, StoreUser.Role.CUSTOMER);
        EmailVerificationService service = new EmailVerificationService(
                tokens, users, mail, "http://localhost:5173/verify-email",
                "no-reply@example.com", 24);

        service.issueToken(customer);

        var messageCaptor = forClass(SimpleMailMessage.class);
        verify(mail).send(messageCaptor.capture());
        assertEquals("test@example.com", messageCaptor.getValue().getTo()[0]);
        assertEquals("no-reply@example.com", messageCaptor.getValue().getFrom());
        assertTrue(messageCaptor.getValue().getText().contains("token="));

        doThrow(new MailSendException("SMTP unavailable")).when(mail).send(any(SimpleMailMessage.class));
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.issueToken(customer));
        assertEquals(503, exception.getStatusCode().value());
    }
}
