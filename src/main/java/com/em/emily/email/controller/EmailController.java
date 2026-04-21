package com.em.emily.email.controller;

import com.em.emily.email.config.RabbitConfig;
import com.em.emily.email.dto.EmailRequest;
import com.em.emily.email.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;
    private final RabbitTemplate rabbitTemplate;

    // Direct synchronous send
    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@Valid @RequestBody EmailRequest request) {
        emailService.sendEmail(request.to(), request.cc(), request.bcc(),
                request.replyTo(), request.subject(), request.body());
        return ResponseEntity.accepted().body("Email processing started.");
    }

    // Direct synchronous attachment send
    @PostMapping("/send-attachment")
    public ResponseEntity<String> sendEmailWithAttachment(
            @RequestParam("to") List<String> to,
            @RequestParam("subject") String subject,
            @RequestParam("body") String body,
            @RequestPart("file") MultipartFile file) {

        emailService.sendEmailWithAttachment(to, subject, body, file);
        return ResponseEntity.accepted().body("Attachment email processing started.");
    }

    @PostMapping("/schedule")
    public ResponseEntity<String> scheduleEmail(
            @Valid @RequestBody EmailRequest request,
            @RequestParam long delayInSeconds) {

        // Correct way to set the delay for the RabbitMQ delayed-message-exchange
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, "email.route", request, m -> {
            // Use setHeader with "x-delay"
            m.getMessageProperties().setHeader("x-delay", (int) delayInSeconds * 1000);
            return m;
        });

        return ResponseEntity.accepted().body("Email queued for " + delayInSeconds + "s delay.");
    }
}