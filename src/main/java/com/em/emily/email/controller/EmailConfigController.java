package com.em.emily.email.controller;

import com.em.emily.email.model.EmailConfig;
import com.em.emily.email.model.EmailProviderType;
import com.em.emily.email.repository.EmailConfigRepository;
import com.em.emily.email.service.MailSenderFactory;
import com.em.emily.email.service.MailSenderStrategy;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/email/config")
public class EmailConfigController {

    private final EmailConfigRepository configRepository;
    private final MailSenderFactory mailSenderFactory;

    public EmailConfigController(EmailConfigRepository configRepository, MailSenderFactory mailSenderFactory) {
        this.configRepository = configRepository;
        this.mailSenderFactory = mailSenderFactory;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getConfig(@AuthenticationPrincipal UUID userId) {
        Optional<EmailConfig> configOpt = configRepository.findByUserId(userId);
        if (configOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("configured", false));
        }

        EmailConfig config = configOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("configured", true);
        response.put("providerType", config.getProviderType());
        response.put("fromEmail", config.getFromEmail());
        response.put("smtpHost", config.getSmtpHost());
        response.put("smtpPort", config.getSmtpPort());
        response.put("smtpUsername", config.getSmtpUsername());
        // Return masked API key to avoid exposing secret keys
        response.put("apiKey", config.getEncryptedApiKey() != null ? "••••••••••••" : null);
        response.put("isActive", config.isActive());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<EmailConfig> saveConfig(@AuthenticationPrincipal UUID userId, @RequestBody Map<String, Object> payload) {
        Optional<EmailConfig> existingOpt = configRepository.findByUserId(userId);

        EmailConfig config = existingOpt.orElseGet(() -> EmailConfig.builder().userId(userId).build());

        config.setProviderType(EmailProviderType.valueOf((String) payload.get("providerType")));
        config.setFromEmail((String) payload.get("fromEmail"));
        config.setActive(true);

        if (config.getProviderType() == EmailProviderType.SMTP) {
            config.setSmtpHost((String) payload.get("smtpHost"));
            config.setSmtpPort(payload.get("smtpPort") != null ? Integer.parseInt(payload.get("smtpPort").toString()) : null);
            config.setSmtpUsername((String) payload.get("smtpUsername"));
        } else {
            config.setSmtpHost(null);
            config.setSmtpPort(null);
            config.setSmtpUsername(null);
        }

        String incomingKey = (String) payload.get("apiKey");
        // "Masked Password Trap" protection:
        if (incomingKey != null && !incomingKey.equals("••••••••••••")) {
            config.setEncryptedApiKey(incomingKey);
        }

        EmailConfig saved = configRepository.save(config);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testConfig(@AuthenticationPrincipal UUID userId, @RequestBody Map<String, Object> payload) {
        EmailConfig testConfig = new EmailConfig();
        testConfig.setProviderType(EmailProviderType.valueOf((String) payload.get("providerType")));
        testConfig.setFromEmail((String) payload.get("fromEmail"));

        if (testConfig.getProviderType() == EmailProviderType.SMTP) {
            testConfig.setSmtpHost((String) payload.get("smtpHost"));
            testConfig.setSmtpPort(payload.get("smtpPort") != null ? Integer.parseInt(payload.get("smtpPort").toString()) : null);
            testConfig.setSmtpUsername((String) payload.get("smtpUsername"));
        }

        String incomingKey = (String) payload.get("apiKey");
        if (incomingKey != null && incomingKey.equals("••••••••••••")) {
            // Retrieve existing key to perform test
            Optional<EmailConfig> existingOpt = configRepository.findByUserId(userId);
            if (existingOpt.isPresent()) {
                testConfig.setEncryptedApiKey(existingOpt.get().getEncryptedApiKey());
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No existing credentials found to test."));
            }
        } else {
            testConfig.setEncryptedApiKey(incomingKey);
        }

        try {
            MailSenderStrategy sender = mailSenderFactory.getSender(testConfig.getProviderType());
            sender.send(testConfig, List.of(testConfig.getFromEmail()), null, null, "Test Connection Email", "This email confirms your dynamic provider configuration is functional!", null);
            return ResponseEntity.ok(Map.of("success", true, "message", "Test email dispatched successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
