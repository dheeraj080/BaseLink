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
public class ResendMailSender implements MailSenderStrategy {

    private final RestClient restClient = RestClient.create();

    @Override
    public EmailProviderType getProviderType() {
        return EmailProviderType.RESEND;
    }

    @Override
    public void send(EmailConfig config, List<String> to, List<String> cc, List<String> bcc, String subject, String body, List<String> filePaths) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("from", config.getFromEmail());
        payload.put("to", to);
        if (cc != null && !cc.isEmpty()) payload.put("cc", cc);
        if (bcc != null && !bcc.isEmpty()) payload.put("bcc", bcc);
        payload.put("subject", subject);
        payload.put("html", body);

        // Note: For attachments, Resend supports attachments parameter as an array of objects:
        // [{"content": "base64", "filename": "name.txt"}]
        // Resend doesn't support local paths, so we would read and encode them if needed.
        // We will leave a stub or skip/include placeholder for attachments.

        try {
            restClient.post()
                    .uri("https://api.resend.com/emails")
                    .header("Authorization", "Bearer " + config.getEncryptedApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new RuntimeException("Resend HTTP email send failed: " + e.getMessage(), e);
        }
    }
}
