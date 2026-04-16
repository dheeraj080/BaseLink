//package com.em.emily.email.service.impl;
//
//import com.em.emily.email.service.EmailService;
//import jakarta.mail.MessagingException;
//import jakarta.mail.internet.MimeMessage;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.core.io.FileSystemResource;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.javamail.MimeMessageHelper;
//import org.springframework.scheduling.annotation.Async;
//import org.springframework.stereotype.Service;
//import java.io.File;
//
//@Service
//public class EmailServiceImpl implements EmailService {
//
//    @Autowired
//    private JavaMailSender emailSender;
//
//    // 1. Send simple text email
//    @Async
//    @Override
//    public void sendSimpleMessage(String to, String subject, String text) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setFrom("kambledheerajkumar@gmail.com");
//        message.setTo(to);
//        message.setSubject(subject);
//        message.setText(text);
//        emailSender.send(message);
//    }
//
//    // 2. Send HTML email to multiple people (BCC)
//    @Async
//    @Override
//    public void sendHtmlMessage(String[] to, String subject, String htmlBody) {
//        MimeMessage message = emailSender.createMimeMessage();
//        try {
//            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
//            helper.setBcc(to);
//            helper.setSubject(subject);
//            helper.setText(htmlBody, true); // The 'true' flag denotes HTML content
//            emailSender.send(message);
//        } catch (MessagingException e) {
//            throw new RuntimeException("Failed to send HTML email", e);
//        }
//    }
//
//    // 3. Send email with a file attachment
//    @Async
//    @Override
//    public void sendMessageWithAttachment(String to, String subject, String text, String pathToAttachment) {
//        MimeMessage message = emailSender.createMimeMessage();
//        try {
//            MimeMessageHelper helper = new MimeMessageHelper(message, true);
//            helper.setTo(to);
//            helper.setSubject(subject);
//            helper.setText(text);
//
//            FileSystemResource file = new FileSystemResource(new File(pathToAttachment));
//            helper.addAttachment(file.getFilename(), file);
//
//            emailSender.send(message);
//        } catch (MessagingException e) {
//            throw new RuntimeException("Failed to send email with attachment", e);
//        }
//    }
//}