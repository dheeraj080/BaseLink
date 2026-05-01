package com.em.emily.email.controller;


import com.em.emily.email.config.RabbitConfig;
import com.em.emily.email.EmailRequest;
import com.em.emily.email.model.EmailLog;
import com.em.emily.email.quartz.EmailJob;
import com.em.emily.email.repository.EmailRepository;
import com.em.emily.email.service.EmailService;
import com.em.emily.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.quartz.*;
import org.quartz.impl.matchers.GroupMatcher;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/email")
@RequiredArgsConstructor // Automatically generates the constructor
public class EmailController {

    private final EmailService emailService;
    private final Scheduler scheduler;
    private final EmailRepository emailRepository;

    private final RabbitTemplate rabbitTemplate;
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
                request.replyTo(), // Fix: pass replyTo from request
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
            // Using OffsetDateTime first as it is more robust for strings with only offsets (e.g. +05:30)
            utcTime = java.time.OffsetDateTime.parse(scheduleTime).toZonedDateTime().withZoneSameInstant(ZoneOffset.UTC);
        } catch (java.time.format.DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid scheduleTime format: " + scheduleTime + ". Expected ISO 8601 format (e.g. 2024-05-01T10:00:00+05:30)");
        }

        if (utcTime.isBefore(ZonedDateTime.now(ZoneOffset.UTC))) {
            return ResponseEntity.badRequest().body("Cannot schedule emails in the past. Current UTC time is: " + ZonedDateTime.now(ZoneOffset.UTC));
        }

        // Save files via StorageService if present
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

            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity("trigger-" + UUID.randomUUID())
                    .startAt(Date.from(utcTime.toInstant()))
                    .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                            .withMisfireHandlingInstructionFireNow())
                    .build();

            scheduler.scheduleJob(jobDetail, trigger);
            return ResponseEntity.accepted().body("Email scheduled for: " + utcTime + " UTC");
        } catch (SchedulerException e) {
            return ResponseEntity.internalServerError().body("Scheduler failed: " + e.getMessage());
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
                request.to(),
                request.cc(),
                request.bcc(),
                request.replyTo(),
                request.subject(),
                request.body(),
                principal != null ? principal.id() : null,
                request.isMarketing(),
                files
        );
        return ResponseEntity.ok("Email with attachments queued for delivery.");
    }
}