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

        // 1. Prepare data
        List<String> to = List.of(dataMap.getString("to").split(","));
        String subject = dataMap.getString("subject");
        String body = dataMap.getString("body");

        // 2. Call the correct method with all 6 parameters
        // We pass 'null' for CC, BCC, and ReplyTo as they aren't in the job data
        emailService.sendEmail(to, null, null, null, subject, body);
    }
}