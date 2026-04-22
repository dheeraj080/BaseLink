package com.em.emily.email.service;

import com.em.emily.email.model.EmailLog;
import com.em.emily.email.model.EmailStatus;
import com.em.emily.email.repository.EmailRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private EmailRepository emailRepository;

    @InjectMocks
    private EmailService emailService;

    @Mock
    private MimeMessage mimeMessage;

    @Mock
    private MultipartFile multipartFile;

    private List<String> to;
    private String subject;
    private String body;

    @BeforeEach
    void setUp() {
        to = List.of("test@example.com");
        subject = "Test Subject";
        body = "Test Body";
    }

    @Test
    void sendEmail_Success() {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(emailRepository.save(any(EmailLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        emailService.sendEmail(to, null, null, null, subject, body);

        // Assert
        verify(mailSender).send(mimeMessage);
        
        ArgumentCaptor<EmailLog> logCaptor = ArgumentCaptor.forClass(EmailLog.class);
        verify(emailRepository, times(2)).save(logCaptor.capture());
        
        List<EmailLog> savedLogs = logCaptor.getAllValues();
        // Since EmailLog is mutable and we capture the same instance twice, 
        // both entries in the captor will show the final state (SENT).
        // To verify PENDING was set, we could use a Mockito Answer, 
        // but for now let's just verify the final state is correct.
        assertEquals(EmailStatus.SENT, savedLogs.get(1).getStatus());
        assertNotNull(savedLogs.get(1).getSentAt());
    }

    @Test
    void sendEmail_Failure_MailException() {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailException("Connection failed") {}).when(mailSender).send(mimeMessage);
        when(emailRepository.save(any(EmailLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        emailService.sendEmail(to, null, null, null, subject, body);

        // Assert
        verify(mailSender).send(mimeMessage);
        
        ArgumentCaptor<EmailLog> logCaptor = ArgumentCaptor.forClass(EmailLog.class);
        verify(emailRepository, times(2)).save(logCaptor.capture());
        
        List<EmailLog> savedLogs = logCaptor.getAllValues();
        assertEquals(EmailStatus.FAILED, savedLogs.get(1).getStatus());
        assertEquals("Connection failed", savedLogs.get(1).getErrorMessage());
    }

    @Test
    void sendEmail_RecipientEmpty_ReturnsEarly() {
        // Act
        emailService.sendEmail(Collections.emptyList(), null, null, null, subject, body);

        // Assert
        verifyNoInteractions(mailSender);
        verifyNoInteractions(emailRepository);
    }

    @Test
    void sendEmailWithAttachment_Success() {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(multipartFile.getOriginalFilename()).thenReturn("test.pdf");
        when(multipartFile.isEmpty()).thenReturn(false);
        when(emailRepository.save(any(EmailLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        emailService.sendEmailWithAttachment(to, subject, body, multipartFile);

        // Assert
        verify(mailSender).send(mimeMessage);
        
        ArgumentCaptor<EmailLog> logCaptor = ArgumentCaptor.forClass(EmailLog.class);
        verify(emailRepository, times(2)).save(logCaptor.capture());
        
        List<EmailLog> savedLogs = logCaptor.getAllValues();
        assertEquals(EmailStatus.SENT, savedLogs.get(1).getStatus());
        assertTrue(savedLogs.get(0).getSubject().contains("[Attachment: test.pdf]"));
    }

    @Test
    void sendEmailWithAttachment_Failure() {
        // Arrange
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(multipartFile.getOriginalFilename()).thenReturn("test.pdf");
        doThrow(new MailException("SMTP error") {}).when(mailSender).send(mimeMessage);
        when(emailRepository.save(any(EmailLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        emailService.sendEmailWithAttachment(to, subject, body, multipartFile);

        // Assert
        ArgumentCaptor<EmailLog> logCaptor = ArgumentCaptor.forClass(EmailLog.class);
        verify(emailRepository, times(2)).save(logCaptor.capture());
        
        assertEquals(EmailStatus.FAILED, logCaptor.getAllValues().get(1).getStatus());
    }
}
