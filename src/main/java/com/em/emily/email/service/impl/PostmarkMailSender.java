package com.em.emily.email.service.impl;

import com.em.emily.email.model.EmailConfig;
import com.em.emily.email.model.EmailProviderType;
import com.em.emily.email.service.MailSenderStrategy;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PostmarkMailSender implements MailSenderStrategy {

    private final RestClient restClient = RestClient.create();

    @Override
    public EmailProviderType getProviderType() {
        return EmailProviderType.POSTMARK;
    }

    @Override
    public void send(EmailConfig config, List<String> to, List<String> cc, List<String> bcc, String subject, String body, List<String> filePaths) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("From", config.getFromEmail());
        payload.put("To", String.join(",", to));
        if (cc != null && !cc.isEmpty()) {
            payload.put("Cc", String.join(",", cc));
        }
        if (bcc != null && !bcc.isEmpty()) {
            payload.put("Bcc", String.join(",", bcc));
        }
        payload.put("Subject", subject);
        payload.put("HtmlBody", body);

        try {
            restClient.post()
                    .uri("https://api.postmarkapp.com/email")
                    .header("X-Postmark-Server-Token", config.getEncryptedApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new RuntimeException("Postmark HTTP email send failed: " + e.getMessage(), e);
        }
    }
}
