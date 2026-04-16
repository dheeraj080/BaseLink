package com.em.emily.email.quartz;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.apache.tomcat.Jar;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.mail.autoconfigure.MailProperties;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

@Component
public class EmailJob extends QuartzJobBean {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private MailProperties mailProperties;

    @Override
    protected void executeInternal(JobExecutionContext jobExecutionContext) {
        JobDataMap jobDataMap = jobExecutionContext.getJobDetail().getJobDataMap();

        String email = jobDataMap.getString("subject");
        String body = jobDataMap.getString("body");
        String recipientsEmail = jobDataMap.getString("email");

        sendMail(mailProperties.getUsername(), email, body, recipientsEmail);
    }

    private void sendMail(String fromEmail, String toEmail, String subject, String body) {
        try{
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setSubject(subject);
            helper.setText(body, true);
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);

            mailSender.send(mimeMessage);
        }catch(MessagingException ex){
            System.out.println(ex);

        }
    }


}
