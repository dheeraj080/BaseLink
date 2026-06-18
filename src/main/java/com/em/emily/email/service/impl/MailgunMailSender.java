package com.em.emily.email.service.impl;

import com.em.emily.email.model.EmailConfig;
import com.em.emily.email.model.EmailProviderType;
import com.em.emily.email.service.MailSenderStrategy;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@Service
public class MailgunMailSender implements MailSenderStrategy {

    private final RestClient restClient = RestClient.create();

    @Override
    public EmailProviderType getProviderType() {
        return EmailProviderType.MAILGUN;
    }

    @Override
    public void send(EmailConfig config, List<String> to, List<String> cc, List<String> bcc, String subject, String body, List<String> filePaths) {
        String fromEmail = config.getFromEmail();
        String domain = fromEmail.substring(fromEmail.indexOf("@") + 1);

        MultiValueMap<String, String> payload = new LinkedMultiValueMap<>();
        payload.add("from", fromEmail);
        for (String recipient : to) {
            payload.add("to", recipient);
        }
        if (cc != null) {
            for (String recipient : cc) {
                payload.add("cc", recipient);
            }
        }
        if (bcc != null) {
            for (String recipient : bcc) {
                payload.add("bcc", recipient);
            }
        }
        payload.add("subject", subject);
        payload.add("html", body);

        String auth = "api:" + config.getEncryptedApiKey();
        String base64Auth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

        try {
            restClient.post()
                    .uri("https://api.mailgun.net/v3/" + domain + "/messages")
                    .header("Authorization", "Basic " + base64Auth)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new RuntimeException("Mailgun HTTP email send failed: " + e.getMessage(), e);
        }
    }
}
