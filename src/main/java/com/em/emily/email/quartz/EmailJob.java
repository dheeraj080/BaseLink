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
    private final com.em.emily.storage.service.StorageService storageService;

    public EmailJob(EmailService emailService, com.em.emily.storage.service.StorageService storageService) {
        this.emailService = emailService;
        this.storageService = storageService;
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
        String ccRaw = dataMap.getString("cc");
        List<String> cc = (ccRaw != null && !ccRaw.isEmpty()) ? List.of(ccRaw.split(",")) : null;
        String bccRaw = dataMap.getString("bcc");
        List<String> bcc = (bccRaw != null && !bccRaw.isEmpty()) ? List.of(bccRaw.split(",")) : null;
        
        String subject = dataMap.getString("subject");
        String body = dataMap.getString("body");
        String replyTo = dataMap.getString("replyTo");
        String userIdStr = dataMap.getString("userId");
        java.util.UUID userId = (userIdStr != null && !userIdStr.isEmpty()) ? java.util.UUID.fromString(userIdStr) : null;
        String isMarketingStr = dataMap.getString("isMarketing");
        Boolean isMarketing = isMarketingStr != null ? Boolean.valueOf(isMarketingStr) : true;

        String attachmentIdsRaw = dataMap.getString("attachmentIds");
        if (attachmentIdsRaw != null && !attachmentIdsRaw.isEmpty()) {
            List<String> ids = List.of(attachmentIdsRaw.split(";"));
            List<String> filePaths = new java.util.ArrayList<>();
            for (String id : ids) {
                filePaths.add(storageService.load(id).getAbsolutePath());
            }
            emailService.sendEmailWithFileSystemAttachments(to, cc, bcc, replyTo, subject, body, userId, isMarketing, filePaths);
            
            // Clean up files after scheduling them for sending
            // Note: sendEmailWithFileSystemAttachments is @Async, so we should be careful.
            // Actually, sendEmailWithFileSystemAttachments is @Async but called from a Quartz thread.
            // It might be better to let a separate cleanup task handle this later,
            // or just leave them if we want to support retries.
        } else {
            emailService.sendEmail(to, cc, bcc, replyTo, subject, body, userId, isMarketing);
        }
    }
}