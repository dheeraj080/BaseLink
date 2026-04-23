package com.em.emily.email.consumer;

import com.em.emily.email.config.RabbitConfig;
import com.em.emily.email.dto.EmailRequest;
import com.em.emily.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailEventListener {

    private final EmailService emailService;

    @RabbitListener(queues = {RabbitConfig.QUEUE, RabbitConfig.TRANSACTIONAL_QUEUE})
    public void handleEmailEvent(EmailRequest request) {
        log.info("Received scheduled email request for: {}", request.to());
        try {
            emailService.sendEmail(
                    request.to(),
                    request.cc(),
                    request.bcc(),
                    request.replyTo(),
                    request.subject(),
                    request.body()
            );
            log.info("Successfully processed scheduled email.");
        } catch (Exception e) {
            log.error("Failed to process scheduled email", e);
            // In a real app, you might send this to a Dead Letter Queue (DLQ)
        }
    }
}