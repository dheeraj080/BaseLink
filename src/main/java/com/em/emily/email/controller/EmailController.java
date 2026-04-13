package com.em.emily.email.controller;

import com.em.emily.email.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mail")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/welcome")
    public String sendWelcome(@RequestParam String email) {
        emailService.sendSimpleMessage(email, "Welcome!", "Thanks for joining us!");
        return "Email sent successfully!";
    }

    @PostMapping("/newsletter")
    public String sendNewsletter(@RequestBody String[] emails) {
        String html = "<h1>Weekly News</h1><p>Check out our new features!</p>";
        emailService.sendHtmlMessage(emails, "Our Weekly Newsletter", html);
        return "Newsletter sent to " + emails.length + " users.";
    }

    @PostMapping("/send-to-selected")
    public ResponseEntity<String> sendBulk(@RequestParam String subject, @RequestBody String htmlContent) {
        // 1. Get emails of selected contacts
        String[] recipients = contactService.getSelectedEmails();

        // 2. Fire and forget! (Thanks to @Async)
        emailService.sendHtmlMessage(recipients, subject, htmlContent);

        return ResponseEntity.ok("Email processing started for " + recipients.length + " contacts.");
    }
}