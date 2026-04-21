package com.em.emily.email.service;

import com.em.emily.email.model.EmailLog;
import com.em.emily.email.model.EmailStatus;
import com.em.emily.email.repository.EmailRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final EmailRepository emailRepository;

    public EmailService(JavaMailSender mailSender, EmailRepository emailRepository) {
        this.mailSender = mailSender;
        this.emailRepository = emailRepository;
    }

    @Async("taskExecutor")
    public void sendEmail(List<String> to, List<String> cc, List<String> bcc, String replyTo, String subject, String body) {
        EmailLog logEntry = new EmailLog();
        logEntry.setRecipient(String.join(",", to));
        logEntry.setSubject(subject);
        logEntry = emailRepository.save(logEntry);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to.toArray(new String[0]));
            if (cc != null) helper.setCc(cc.toArray(new String[0]));
            if (bcc != null) helper.setBcc(bcc.toArray(new String[0]));
            if (replyTo != null) helper.setReplyTo(replyTo);

            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);

            logEntry.setStatus(EmailStatus.SENT);
            logEntry.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            logEntry.setStatus(EmailStatus.FAILED);
            logEntry.setErrorMessage(e.getMessage());
            log.error("Email failed: {}", e.getMessage());
        }
        emailRepository.save(logEntry);
    }

    @Async("taskExecutor")
    public void sendEmailWithAttachment(List<String> to, String subject, String body, MultipartFile file) {
        // 1. Create and Save "PENDING" log
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

            // MultipartFile implements InputStreamSource, so it can be passed directly
            helper.addAttachment(file.getOriginalFilename(), file);

            mailSender.send(message);

            // 2. Update to "SENT"
            logEntry.setStatus(EmailStatus.SENT);
            logEntry.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            // 3. Update to "FAILED"
            logEntry.setStatus(EmailStatus.FAILED);
            logEntry.setErrorMessage(e.getMessage());
            log.error("Email with attachment failed: {}", e.getMessage());
        }
        emailRepository.save(logEntry);
    }
}