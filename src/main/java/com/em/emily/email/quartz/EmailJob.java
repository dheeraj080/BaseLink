package com.em.emily.email.quartz;

import com.em.emily.email.service.EmailService;
import org.quartz.JobExecutionContext;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class EmailJob extends QuartzJobBean {

    private final EmailService emailService;

    public EmailJob(EmailService emailService) {
        this.emailService = emailService;
    }

    @Override
    protected void executeInternal(JobExecutionContext context) {
        var dataMap = context.getMergedJobDataMap();

        // 1. Retrieve the comma-separated String from the map
        // This resolves the ClassCastException because we are explicitly getting a String
        String toCsv = dataMap.getString("to");

        // 2. Convert the String back into a List<String>
        // We split the string by the comma used in JobScheduler
        List<String> to = Arrays.asList(toCsv.split(","));

        String subject = dataMap.getString("subject");
        String body = dataMap.getString("body");

        // 3. Execute the email service logic
        emailService.sendEmail(to, null, null, null, subject, body);
    }
}