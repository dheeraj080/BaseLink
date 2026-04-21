package com.em.emily.email.controller;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/email")
public class EmailController {

    @Autowired
    private JavaMailSender mailSender;

    public EmailController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @RequestMapping("send-email")
    public String sendEmail() {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom("kambledheerajkumar@gamil.com");
            message.setTo("dheerajk1568@gmail.com");
            message.setSubject("Simple Text email form spring boot");
            message.setText("Hello World");

            mailSender.send(message);

            return "Email Sent";

        } catch (Exception e) {
            return e.getMessage();
        }
    }

    @RequestMapping("send-email-with-attachment")
    public String sendEmailWithAttachment() {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("kambledheerajkumar@gamil.com");
            helper.setTo("dheerajk1568@gmail.com");
            helper.setSubject("Attachment Text email form spring boot");
            helper.setText("Hello World with Attachment");

            ClassPathResource file = new ClassPathResource("attachments/server.py");

            helper.addAttachment("attachments/server.py", file);


            mailSender.send(message);
            return "Email Sent";

        } catch (Exception e) {
            return e.getMessage();
        }
    }

    @RequestMapping("/send-html-email")
    public String sendHtmlEmail() {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("kambledheerajkumar@gamil.com");
            helper.setTo("dheerajk1568@gmail.com");
            helper.setSubject("Java email with attachment | From GC");

            try (var inputStream = Objects.requireNonNull(EmailController.class.getResourceAsStream("/templates/email-template.html"))) {
                helper.setText(
                        new String(inputStream.readAllBytes(), StandardCharsets.UTF_8),
                        true
                );
            }
            mailSender.send(message);
            return "success!";
        } catch (Exception e) {
            return e.getMessage();
        }
    }


}
