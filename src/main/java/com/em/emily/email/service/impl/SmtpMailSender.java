package com.em.emily.email.service.impl;

import com.em.emily.email.model.EmailConfig;
import com.em.emily.email.model.EmailProviderType;
import com.em.emily.email.service.MailSenderStrategy;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;
import java.util.Properties;

@Service
public class SmtpMailSender implements MailSenderStrategy {

    @Override
    public EmailProviderType getProviderType() {
        return EmailProviderType.SMTP;
    }

    @Override
    public void send(EmailConfig config, List<String> to, List<String> cc, List<String> bcc, String subject, String body, List<String> filePaths) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(config.getSmtpHost());
        mailSender.setPort(config.getSmtpPort());
        mailSender.setUsername(config.getSmtpUsername());
        mailSender.setPassword(config.getEncryptedApiKey());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(config.getFromEmail());
            helper.setTo(to.toArray(new String[0]));
            if (cc != null && !cc.isEmpty()) helper.setCc(cc.toArray(new String[0]));
            if (bcc != null && !bcc.isEmpty()) helper.setBcc(bcc.toArray(new String[0]));
            helper.setSubject(subject);
            helper.setText(body, true);

            if (filePaths != null) {
                for (String path : filePaths) {
                    File file = new File(path);
                    if (file.exists()) {
                        helper.addAttachment(file.getName(), file);
                    }
                }
            }

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("SMTP email send failed", e);
        }
    }
}
