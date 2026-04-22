package com.em.emily.email.controller;

import com.em.emily.email.dto.EmailRequest;
import com.em.emily.email.model.EmailLog;
import com.em.emily.email.quartz.EmailJob;
import com.em.emily.email.repository.EmailRepository;
import com.em.emily.email.service.EmailService;
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
public class EmailController {

    private final EmailService emailService;
    private final Scheduler scheduler;
    private final EmailRepository emailRepository;

    public EmailController(EmailService emailService, Scheduler scheduler, EmailRepository emailRepository) {
        this.emailService = emailService;
        this.scheduler = scheduler;
        this.emailRepository = emailRepository;
    }

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
                    jobInfo.put("nextFireTime", trigger.getNextFireTime());
                    jobInfo.put("status", trigger.getFireTimeAfter(new Date()) != null ? "SCHEDULED" : "FINISHED");

                    // Extract Data sent to the job
                    jobInfo.put("data", jobDetail.getJobDataMap());

                    jobDetails.add(jobInfo);
                }
            }
        }
        return ResponseEntity.ok(jobDetails);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<EmailLog>> getEmailLogs() {
        return ResponseEntity.ok(emailRepository.findAll());
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest request) {
        // Corrected method name: sendEmail
        // Added nulls for CC, BCC, and replyTo to match your Service signature
        emailService.sendEmail(
                request.to(),
                null, // CC
                null, // BCC
                null, // replyTo
                request.subject(),
                request.body()
        );
        return ResponseEntity.ok("Email sent immediately.");
    }

    // 2. Scheduled Send (Quartz Way)
    @PostMapping("/schedule")
    public ResponseEntity<String> scheduleEmail(
            @RequestBody EmailRequest request,
            @RequestParam LocalDateTime scheduleTime) {

        // Enforce UTC Conversion
        ZonedDateTime zdt = ZonedDateTime.of(scheduleTime, ZoneId.systemDefault());
        ZonedDateTime utcTime = zdt.withZoneSameInstant(ZoneOffset.UTC);

        // Build the Quartz Job
        JobDetail jobDetail = JobBuilder.newJob(EmailJob.class)
                .withIdentity("email-" + UUID.randomUUID())
                .usingJobData("to", String.join(",", request.to())) // Adjust based on your EmailRequest implementation
                .usingJobData("subject", request.subject())
                .usingJobData("body", request.body())
                .build();

        // Build the Trigger
        // Example: Tell Quartz to retry the job if it fails
        Trigger trigger = TriggerBuilder.newTrigger()
                .withIdentity("trigger-" + UUID.randomUUID())
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withIntervalInMinutes(5) // Retry every 5 minutes
                        .withRepeatCount(3))      // Try 3 times
                .startAt(Date.from(utcTime.toInstant()))
                .build();

        // Schedule it
        try {
            scheduler.scheduleJob(jobDetail, trigger);
            return ResponseEntity.accepted().body("Email scheduled for: " + utcTime + " UTC");
        } catch (SchedulerException e) {
            return ResponseEntity.internalServerError().body("Scheduler failed: " + e.getMessage());
        }
    }
}