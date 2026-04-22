package com.em.emily.email.quartz;

import com.em.emily.email.service.EmailService;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmailJob extends QuartzJobBean {

    private final EmailService emailService;

    public EmailJob(EmailService emailService) {
        this.emailService = emailService;
    }

    @Override
    protected void executeInternal(JobExecutionContext context) {
        JobDataMap dataMap = context.getMergedJobDataMap();

        // Defensive programming: Use getOrDefault or check for nulls
        String toRaw = dataMap.getString("to");
        if (toRaw == null || toRaw.isEmpty()) {
            // Log a warning or throw a JobExecutionException to let Quartz handle retries
            throw new RuntimeException("Job failed: Recipient list is empty.");
        }

        List<String> to = List.of(toRaw.split(","));
        String subject = dataMap.getString("subject");
        String body = dataMap.getString("body");

        emailService.sendEmail(to, null, null, null, subject, body);
    }
}