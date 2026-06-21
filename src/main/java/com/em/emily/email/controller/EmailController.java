package com.em.emily.email.controller;

import com.em.emily.email.EmailRequest;
import com.em.emily.email.model.EmailDraft;
import com.em.emily.email.model.EmailLog;
import com.em.emily.email.quartz.EmailJob;
import com.em.emily.email.repository.EmailRepository;
import com.em.emily.email.service.EmailDraftService;
import com.em.emily.email.service.EmailService;
import com.em.emily.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.quartz.*;
import org.quartz.impl.matchers.GroupMatcher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;
    private final EmailDraftService draftService;
    private final Scheduler scheduler;
    private final EmailRepository emailRepository;
    private final StorageService storageService;

    @GetMapping("/status")
    public ResponseEntity<List<Map<String, Object>>> getScheduledJobs() throws SchedulerException {
        List<Map<String, Object>> jobDetails = new ArrayList<>();
        for (String groupName : scheduler.getJobGroupNames()) {
            for (JobKey jobKey : scheduler.getJobKeys(GroupMatcher.jobGroupEquals(groupName))) {
                JobDetail jobDetail = scheduler.getJobDetail(jobKey);
                List<? extends Trigger> triggers = scheduler.getTriggersOfJob(jobKey);
                for (Trigger trigger : triggers) {
                    Map<String, Object> jobInfo = new HashMap<>();
                    jobInfo.put("jobName", jobKey.getName());
                    jobInfo.put("groupName", groupName);
                    jobInfo.put("nextFireTime", trigger.getNextFireTime());
                    jobInfo.put("status", trigger.getFireTimeAfter(new Date()) != null ? "SCHEDULED" : "FINISHED");
                    jobInfo.put("data", jobDetail.getJobDataMap());
                    jobDetails.add(jobInfo);
                }
            }
        }
        return ResponseEntity.ok(jobDetails);
    }

    @DeleteMapping("/schedule/{jobName}")
    public ResponseEntity<Void> cancelScheduledEmail(
            @PathVariable String jobName,
            @RequestParam(defaultValue = "DEFAULT") String group) throws SchedulerException {
        JobKey jobKey = new JobKey(jobName, group);
        if (scheduler.checkExists(jobKey)) {
            scheduler.deleteJob(jobKey);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/logs")
    public ResponseEntity<List<EmailLog>> getEmailLogs(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.em.emily.auth.UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        return ResponseEntity.ok(emailRepository.findByUserId(principal.id()));
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(
            @RequestBody EmailRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.em.emily.auth.UserPrincipal principal) {
        emailService.sendEmail(
                request.to(),
                request.cc(),
                request.bcc(),
                request.replyTo(),
                request.subject(),
                request.body(),
                principal != null ? principal.id() : null,
                request.isMarketing()
        );
        return ResponseEntity.ok("Email sent immediately.");
    }

    @PostMapping(value = "/schedule", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> scheduleEmail(
            @RequestPart("request") EmailRequest request,
            @RequestParam String scheduleTime,
            @RequestPart(value = "files", required = false) List<org.springframework.web.multipart.MultipartFile> files,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.em.emily.auth.UserPrincipal principal) {

        ZonedDateTime utcTime;
        try {
            utcTime = java.time.OffsetDateTime.parse(scheduleTime).toZonedDateTime().withZoneSameInstant(ZoneOffset.UTC);
        } catch (java.time.format.DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid scheduleTime format: " + scheduleTime);
        }

        if (utcTime.isBefore(ZonedDateTime.now(ZoneOffset.UTC))) {
            return ResponseEntity.badRequest().body("Cannot schedule emails in the past.");
        }

        List<String> attachmentIds = new java.util.ArrayList<>();
        if (files != null && !files.isEmpty()) {
            try {
                for (org.springframework.web.multipart.MultipartFile file : files) {
                    if (file != null && !file.isEmpty()) {
                        attachmentIds.add(storageService.store(file));
                    }
                }
            } catch (java.io.IOException e) {
                return ResponseEntity.internalServerError().body("Failed to save attachments: " + e.getMessage());
            }
        }

        try {
            JobDetail jobDetail = JobBuilder.newJob(EmailJob.class)
                    .withIdentity("email-" + UUID.randomUUID())
                    .usingJobData("to", String.join(",", request.to()))
                    .usingJobData("cc", request.cc() != null ? String.join(",", request.cc()) : "")
                    .usingJobData("bcc", request.bcc() != null ? String.join(",", request.bcc()) : "")
                    .usingJobData("subject", request.subject())
                    .usingJobData("body", request.body())
                    .usingJobData("replyTo", request.replyTo() != null ? request.replyTo() : "")
                    .usingJobData("userId", principal != null ? principal.id().toString() : "")
                    .usingJobData("isMarketing", String.valueOf(request.isMarketing()))
                    .usingJobData("attachmentIds", String.join(";", attachmentIds))
                    .build();

            TriggerBuilder<Trigger> triggerBuilder = TriggerBuilder.newTrigger()
                    .withIdentity("trigger-" + UUID.randomUUID())
                    .startAt(Date.from(utcTime.toInstant()));

            if (request.cronExpression() != null && !request.cronExpression().isBlank()) {
                triggerBuilder.withSchedule(CronScheduleBuilder.cronSchedule(request.cronExpression())
                        .withMisfireHandlingInstructionDoNothing());
            } else {
                triggerBuilder.withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withMisfireHandlingInstructionFireNow());
            }

            Trigger trigger = triggerBuilder.build();
            scheduler.scheduleJob(jobDetail, trigger);
            return ResponseEntity.accepted().body("Email scheduled.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Internal Error: " + e.getMessage());
        }
    }

    @PostMapping(value = "/send-with-attachments", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> sendEmailWithAttachments(
            @RequestPart("request") EmailRequest request,
            @RequestPart(value = "files", required = false) List<org.springframework.web.multipart.MultipartFile> files,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.em.emily.auth.UserPrincipal principal) {
        emailService.sendEmailWithAttachments(
                request.to(), request.cc(), request.bcc(), request.replyTo(),
                request.subject(), request.body(), principal != null ? principal.id() : null,
                request.isMarketing(), files
        );
        return ResponseEntity.ok("Email with attachments queued.");
    }

    // --- Drafts ---

    @PostMapping("/drafts")
    public ResponseEntity<?> createDraft(
            @RequestBody EmailRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.em.emily.auth.UserPrincipal principal) {
        try {
            if (principal == null) return ResponseEntity.status(401).build();
            return ResponseEntity.ok(draftService.saveDraft(request, principal.id()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to save draft: " + e.getMessage());
        }
    }

    @GetMapping("/drafts")
    public ResponseEntity<?> getDrafts(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.em.emily.auth.UserPrincipal principal) {
        try {
            if (principal == null) return ResponseEntity.status(401).build();
            return ResponseEntity.ok(draftService.getDraftsByUser(principal.id()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to fetch drafts: " + e.getMessage());
        }
    }

    @GetMapping("/drafts/{id}")
    public ResponseEntity<EmailDraft> getDraft(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.em.emily.auth.UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(draftService.getDraft(id, principal.id()));
    }

    @PutMapping("/drafts/{id}")
    public ResponseEntity<EmailDraft> updateDraft(
            @PathVariable Long id,
            @RequestBody EmailRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.em.emily.auth.UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(draftService.updateDraft(id, request, principal.id()));
    }

    @DeleteMapping("/drafts/{id}")
    public ResponseEntity<Void> deleteDraft(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.em.emily.auth.UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        draftService.deleteDraft(id, principal.id());
        return ResponseEntity.noContent().build();
    }
}