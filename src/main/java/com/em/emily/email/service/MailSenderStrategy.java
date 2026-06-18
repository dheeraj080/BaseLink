package com.em.emily.email.service;

import com.em.emily.email.model.EmailConfig;
import java.util.List;

public interface MailSenderStrategy {
    void send(EmailConfig config, List<String> to, List<String> cc, List<String> bcc, String subject, String body, List<String> filePaths);
    com.em.emily.email.model.EmailProviderType getProviderType();
}
