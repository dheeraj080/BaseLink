package com.em.emily.auth.service.impl;

import com.em.emily.auth.service.EmailService;
import com.em.emily.email.config.RabbitConfig;
import com.em.emily.email.EmailRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            EmailRequest request = new EmailRequest(
                    List.of(to),
                    null,
                    null,
                    null,
                    subject,
                    body
            );

            rabbitTemplate.convertAndSend(
                    RabbitConfig.EXCHANGE,
                    RabbitConfig.TRANSACTIONAL_ROUTING_KEY,
                    request
            );
            log.info("✅ Auth email queued successfully for: {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to queue auth email for {}: {}", to, e.getMessage());
        }
    }
}