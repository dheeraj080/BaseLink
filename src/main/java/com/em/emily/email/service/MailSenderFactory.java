package com.em.emily.email.service;

import com.em.emily.email.model.EmailProviderType;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class MailSenderFactory {

    private final Map<EmailProviderType, MailSenderStrategy> strategies = new HashMap<>();

    public MailSenderFactory(List<MailSenderStrategy> strategyList) {
        for (MailSenderStrategy strategy : strategyList) {
            strategies.put(strategy.getProviderType(), strategy);
        }
    }

    public MailSenderStrategy getSender(EmailProviderType type) {
        MailSenderStrategy strategy = strategies.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("No mail sender strategy implemented for provider: " + type);
        }
        return strategy;
    }
}
