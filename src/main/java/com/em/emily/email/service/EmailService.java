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

    @org.springframework.beans.factory.annotation.Value("${app.base-url:http://localhost:5000}")
    private String baseUrl;

    private String instrumentEmailBody(String body, Long emailId, String recipient, Boolean isMarketing) {
        if (body == null) return null;
        
        String modifiedBody = body;
        
        if (Boolean.TRUE.equals(isMarketing)) {
            String trackingPixel = String.format("<img src=\"%s/api/v1/analytics/track/open/%d?recipient=%s\" width=\"1\" height=\"1\" style=\"display:none;\" />", baseUrl, emailId, recipient);
            String unsubscribeFooter = String.format("<br/><br/><hr/><p style=\"font-size:12px;color:#888;\">Don't want to receive these emails? <a href=\"%s/api/v1/analytics/track/unsubscribe/%d?recipient=%s\">Unsubscribe here</a>.</p>", baseUrl, emailId, recipient);
            modifiedBody += trackingPixel + unsubscribeFooter;
        }

        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("href=\"(https?://[^\"]+)\"");
        java.util.regex.Matcher matcher = pattern.matcher(modifiedBody);
        return matcher.replaceAll(mr -> {
            String originalUrl = mr.group(1);
            String encodedUrl = java.net.URLEncoder.encode(originalUrl, java.nio.charset.StandardCharsets.UTF_8);
            return "href=\"" + baseUrl + "/api/v1/analytics/track/click/" + emailId + "?recipient=" + recipient + "&url=" + encodedUrl + "\"";
        });
    }

    @Async("taskExecutor")
    public void sendEmail(List<String> to, List<String> cc, List<String> bcc, String replyTo, String subject, String body) {
        sendEmail(to, cc, bcc, replyTo, subject, body, null);
    }

    @Async("taskExecutor")
    public void sendEmail(List<String> to, List<String> cc, List<String> bcc, String replyTo, String subject, String body, java.util.UUID userId) {
        sendEmail(to, cc, bcc, replyTo, subject, body, userId, true);
    }

    @Async("taskExecutor")
    public void sendEmail(List<String> to, List<String> cc, List<String> bcc, String replyTo, String subject, String body, java.util.UUID userId, Boolean isMarketing) {
        // 1. Validation
        if (to == null || to.isEmpty()) {
            log.error("Cannot send email: Recipient list is empty.");
            return;
        }

        java.util.Set<String> allRecipients = new java.util.HashSet<>();
        if (to != null) allRecipients.addAll(to);
        if (cc != null) allRecipients.addAll(cc);
        if (bcc != null) allRecipients.addAll(bcc);

        for (String recipient : allRecipients) {
            if (recipient == null || recipient.isBlank()) continue;

            EmailLog logEntry = new EmailLog();
            logEntry.setRecipient(recipient);
            logEntry.setSubject(subject);
            logEntry.setStatus(EmailStatus.PENDING);
            logEntry.setUserId(userId);
            logEntry.setMarketing(Boolean.TRUE.equals(isMarketing));
            logEntry = emailRepository.save(logEntry);

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setTo(recipient);
                helper.setSubject(subject);
                helper.setText(instrumentEmailBody(body, logEntry.getId(), recipient, isMarketing), true); // true = HTML enabled

                if (replyTo != null && !replyTo.isBlank()) helper.setReplyTo(replyTo);

                mailSender.send(message);

                logEntry.setStatus(EmailStatus.SENT);
                logEntry.setSentAt(LocalDateTime.now());
                log.info("Email sent successfully to: {}", recipient);

                eventPublisher.publishEvent(new com.em.emily.email.EmailSentEvent(logEntry.getId(), logEntry.getRecipient(), logEntry.getSubject(), logEntry.getSentAt()));

            } catch (MessagingException | MailException e) {
                logEntry.setStatus(EmailStatus.FAILED);
                logEntry.setErrorMessage(e.getMessage());
                log.error("Email failed for recipient {}: {}", recipient, e.getMessage());
            }

            emailRepository.save(logEntry);
        }
    }

    @Async("taskExecutor")
    public void sendEmailWithAttachments(
            List<String> to,
            List<String> cc,
            List<String> bcc,
            String replyTo,
            String subject,
            String body,
            java.util.UUID userId,
            boolean isMarketing,
            List<org.springframework.web.multipart.MultipartFile> files) {
        if (to == null || to.isEmpty()) return;

        for (String recipient : to) {
            if (recipient == null || recipient.isBlank()) continue;

            EmailLog logEntry = new EmailLog();
            logEntry.setRecipient(recipient);
            logEntry.setSubject(subject + (files != null && !files.isEmpty() ? " [Attachments]" : ""));
            logEntry.setStatus(EmailStatus.PENDING);
            logEntry.setUserId(userId);
            logEntry.setMarketing(isMarketing);
            logEntry = emailRepository.save(logEntry);

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setTo(recipient);
                if (cc != null && !cc.isEmpty()) helper.setCc(cc.toArray(new String[0]));
                if (bcc != null && !bcc.isEmpty()) helper.setBcc(bcc.toArray(new String[0]));
                if (replyTo != null && !replyTo.isBlank()) helper.setReplyTo(replyTo);
                
                helper.setSubject(subject);
                helper.setText(instrumentEmailBody(body, logEntry.getId(), recipient, isMarketing), true);

                if (files != null) {
                    for (org.springframework.web.multipart.MultipartFile file : files) {
                        if (file != null && !file.isEmpty()) {
                            helper.addAttachment(java.util.Objects.requireNonNull(file.getOriginalFilename()), file);
                        }
                    }
                }

                mailSender.send(message);

                logEntry.setStatus(EmailStatus.SENT);
                logEntry.setSentAt(LocalDateTime.now());
                eventPublisher.publishEvent(new com.em.emily.email.EmailSentEvent(logEntry.getId(), logEntry.getRecipient(), logEntry.getSubject(), logEntry.getSentAt()));
            } catch (MessagingException | MailException e) {
                logEntry.setStatus(EmailStatus.FAILED);
                logEntry.setErrorMessage(e.getMessage());
                log.error("Email with attachments failed for {}: {}", recipient, e.getMessage());
            }
            emailRepository.save(logEntry);
        }
    }
    @Async("taskExecutor")
    public void sendEmailWithFileSystemAttachments(
            List<String> to,
            List<String> cc,
            List<String> bcc,
            String replyTo,
            String subject,
            String body,
            java.util.UUID userId,
            boolean isMarketing,
            List<String> filePaths) {
        if (to == null || to.isEmpty()) return;

        for (String recipient : to) {
            if (recipient == null || recipient.isBlank()) continue;

            EmailLog logEntry = new EmailLog();
            logEntry.setRecipient(recipient);
            logEntry.setSubject(subject + (filePaths != null && !filePaths.isEmpty() ? " [Attachments]" : ""));
            logEntry.setStatus(EmailStatus.PENDING);
            logEntry.setUserId(userId);
            logEntry.setMarketing(isMarketing);
            logEntry = emailRepository.save(logEntry);

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setTo(recipient);
                if (cc != null && !cc.isEmpty()) helper.setCc(cc.toArray(new String[0]));
                if (bcc != null && !bcc.isEmpty()) helper.setBcc(bcc.toArray(new String[0]));
                if (replyTo != null && !replyTo.isBlank()) helper.setReplyTo(replyTo);

                helper.setSubject(subject);
                helper.setText(instrumentEmailBody(body, logEntry.getId(), recipient, isMarketing), true);

                if (filePaths != null) {
                    for (String path : filePaths) {
                        java.io.File file = new java.io.File(path);
                        if (file.exists()) {
                            helper.addAttachment(file.getName(), file);
                        }
                    }
                }

                mailSender.send(message);

                logEntry.setStatus(EmailStatus.SENT);
                logEntry.setSentAt(LocalDateTime.now());
                eventPublisher.publishEvent(new com.em.emily.email.EmailSentEvent(logEntry.getId(), logEntry.getRecipient(), logEntry.getSubject(), logEntry.getSentAt()));
            } catch (MessagingException | MailException e) {
                logEntry.setStatus(EmailStatus.FAILED);
                logEntry.setErrorMessage(e.getMessage());
                log.error("Email with filesystem attachments failed for {}: {}", recipient, e.getMessage());
            }
            emailRepository.save(logEntry);
        }
    }
}