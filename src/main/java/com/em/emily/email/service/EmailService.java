package com.em.emily.email.service;

import java.io.File;

public interface EmailService {

    void sendSimpleMessage(String to, String subject, String text);

    void sendHtmlMessage(String[] to, String subject, String htmlBody);

    void sendMessageWithAttachment(String to, String subject, String text, String pathToAttachment);
}
