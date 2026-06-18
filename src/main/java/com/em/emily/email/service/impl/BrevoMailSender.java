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
public class BrevoMailSender implements MailSenderStrategy {

    private final RestClient restClient = RestClient.create();

    @Override
    public EmailProviderType getProviderType() {
        return EmailProviderType.BREVO;
    }

    @Override
    public void send(EmailConfig config, List<String> to, List<String> cc, List<String> bcc, String subject, String body, List<String> filePaths) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("sender", Map.of("email", config.getFromEmail()));
        payload.put("to", to.stream().map(email -> Map.of("email", email)).toList());
        payload.put("subject", subject);
        payload.put("htmlContent", body);

        try {
            restClient.post()
                    .uri("https://api.brevo.com/v3/smtp/email")
                    .header("api-key", config.getEncryptedApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new RuntimeException("Brevo HTTP email send failed: " + e.getMessage(), e);
        }
    }
}
