package com.em.emily.email.service;

import com.em.emily.email.model.EmailLog;
import com.em.emily.email.model.EmailStatus;
import com.em.emily.email.repository.EmailRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final EmailRepository emailRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Async("taskExecutor")
    public void sendEmail(List<String> to, List<String> cc, List<String> bcc, String replyTo, String subject, String body) {
        // 1. Validation
        if (to == null || to.isEmpty()) {
            log.error("Cannot send email: Recipient list is empty.");
            return;
        }

        EmailLog logEntry = new EmailLog();
        logEntry.setRecipient(String.join(",", to));
        logEntry.setSubject(subject);
        logEntry.setStatus(EmailStatus.PENDING);
        logEntry = emailRepository.save(logEntry);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to.toArray(new String[0]));
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML enabled

            if (cc != null && !cc.isEmpty()) helper.setCc(cc.toArray(new String[0]));
            if (bcc != null && !bcc.isEmpty()) helper.setBcc(bcc.toArray(new String[0]));
            if (replyTo != null && !replyTo.isBlank()) helper.setReplyTo(replyTo);

            mailSender.send(message);

            logEntry.setStatus(EmailStatus.SENT);
            logEntry.setSentAt(LocalDateTime.now());
            log.info("Email sent successfully to: {}", to);
            
            eventPublisher.publishEvent(new com.em.emily.email.EmailSentEvent(logEntry.getId(), logEntry.getRecipient(), logEntry.getSubject(), logEntry.getSentAt()));

        } catch (MessagingException | MailException e) {
            logEntry.setStatus(EmailStatus.FAILED);
            logEntry.setErrorMessage(e.getMessage());
            log.error("Email failed for recipient {}: {}", to, e.getMessage());
        }

        emailRepository.save(logEntry);
    }

    @Async("taskExecutor")
    public void sendEmailWithAttachment(List<String> to, String subject, String body, MultipartFile file) {
        if (to == null || to.isEmpty()) return;

        EmailLog logEntry = new EmailLog();
        logEntry.setRecipient(String.join(",", to));
        logEntry.setSubject(subject + " [Attachment: " + file.getOriginalFilename() + "]");
        logEntry.setStatus(EmailStatus.PENDING);
        logEntry = emailRepository.save(logEntry);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to.toArray(new String[0]));
            helper.setSubject(subject);
            helper.setText(body, true);

            if (file != null && !file.isEmpty()) {
                helper.addAttachment(file.getOriginalFilename(), file);
            }

            mailSender.send(message);

            logEntry.setStatus(EmailStatus.SENT);
            logEntry.setSentAt(LocalDateTime.now());
            eventPublisher.publishEvent(new com.em.emily.email.EmailSentEvent(logEntry.getId(), logEntry.getRecipient(), logEntry.getSubject(), logEntry.getSentAt()));
        } catch (MessagingException | MailException e) {
            logEntry.setStatus(EmailStatus.FAILED);
            logEntry.setErrorMessage(e.getMessage());
            log.error("Email with attachment failed: {}", e.getMessage());
        }
        emailRepository.save(logEntry);
    }
}