package com.em.emily.email.controller;

import com.em.emily.email.dto.EmailRequest;
import com.em.emily.email.quartz.JobScheduler;
import com.em.emily.email.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.ZonedDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/email")
public class EmailController {

    private final EmailService emailService;
    private final JobScheduler jobScheduler;

    public EmailController(EmailService emailService, JobScheduler jobScheduler) {
        this.emailService = emailService;
        this.jobScheduler = jobScheduler;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@Valid @RequestBody EmailRequest request) {
        emailService.sendEmail(request.to(), request.cc(), request.bcc(), request.replyTo(), request.subject(), request.body());
        return ResponseEntity.accepted().body("Email processing started.");
    }

    @PostMapping(value = "/send-attachment", consumes = {"multipart/form-data"})
    public ResponseEntity<String> sendEmailWithAttachment(
            @RequestParam List<String> to,
            @RequestParam String subject,
            @RequestParam String body,
            @RequestParam MultipartFile file) {
        emailService.sendEmailWithAttachment(to, subject, body, file);
        return ResponseEntity.accepted().body("Attachment email processing started.");
    }

    @PostMapping("/schedule")
    public ResponseEntity<String> scheduleEmail(
            @RequestBody EmailRequest request,
            @RequestParam long delayInSeconds) {

        ZonedDateTime dateTime = ZonedDateTime.now().plusSeconds(delayInSeconds);
        jobScheduler.scheduleEmail(request.to(), request.subject(), request.body(), dateTime);

        return ResponseEntity.accepted().body("Email scheduled for " + dateTime);
    }
}