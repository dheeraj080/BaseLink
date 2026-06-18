package com.em.emily.email.service.impl;

import com.em.emily.email.model.EmailConfig;
import com.em.emily.email.model.EmailProviderType;
import com.em.emily.email.service.MailSenderStrategy;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SendGridMailSender implements MailSenderStrategy {

    private final RestClient restClient = RestClient.create();

    @Override
    public EmailProviderType getProviderType() {
        return EmailProviderType.SENDGRID;
    }

    @Override
    public void send(EmailConfig config, List<String> to, List<String> cc, List<String> bcc, String subject, String body, List<String> filePaths) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("from", Map.of("email", config.getFromEmail()));
        
        List<Map<String, Object>> personalizations = new ArrayList<>();
        Map<String, Object> personalization = new HashMap<>();
        
        List<Map<String, String>> toList = to.stream().map(email -> Map.of("email", email)).toList();
        personalization.put("to", toList);
        personalization.put("subject", subject);

        if (cc != null && !cc.isEmpty()) {
            List<Map<String, String>> ccList = cc.stream().map(email -> Map.of("email", email)).toList();
            personalization.put("cc", ccList);
        }
        if (bcc != null && !bcc.isEmpty()) {
            List<Map<String, String>> bccList = bcc.stream().map(email -> Map.of("email", email)).toList();
            personalization.put("bcc", bccList);
        }
        
        personalizations.add(personalization);
        payload.put("personalizations", personalizations);

        List<Map<String, String>> content = List.of(Map.of(
            "type", "text/html",
            "value", body
        ));
        payload.put("content", content);

        try {
            restClient.post()
                    .uri("https://api.sendgrid.com/v3/mail/send")
                    .header("Authorization", "Bearer " + config.getEncryptedApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new RuntimeException("SendGrid HTTP email send failed: " + e.getMessage(), e);
        }
    }
}
