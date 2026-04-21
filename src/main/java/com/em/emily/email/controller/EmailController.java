package com.em.emily.email.controller;

import com.em.emily.email.dto.EmailRequest;
import com.em.emily.email.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest request) {
        emailService.sendEmail(request.to(), request.subject(), request.body());
        return ResponseEntity.accepted().body("Email processing has been started.");
    }

    @PostMapping(value = "/send-attachment", consumes = {"multipart/form-data"})
    public ResponseEntity<String> sendEmailWithAttachment(
            @RequestParam String to,
            @RequestParam String subject,
            @RequestParam String body,
            @RequestParam MultipartFile file) {
        emailService.sendEmailWithAttachment(to, subject, body, file);
        return ResponseEntity.accepted().body("Attachment email processing has been started.");
    }
}