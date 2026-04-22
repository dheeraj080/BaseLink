package com.em.emily.email.controller;

import com.em.emily.contact.dto.EmailMessage;
import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.service.ContactService;
import com.em.emily.email.config.RabbitConfig;
import com.em.emily.email.dto.EmailRequest;
import com.em.emily.email.model.EmailLog;
import com.em.emily.email.quartz.EmailJob;
import com.em.emily.email.repository.EmailRepository;
import com.em.emily.email.service.EmailService;
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
    private final ContactService contactService;
    private final RabbitTemplate rabbitTemplate;

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
        emailService.sendEmail(
                request.to(),
                request.cc(),
                request.bcc(),
                null, // ReplyTo
                request.subject(),
                request.body()
        );
        return ResponseEntity.ok("Email sent immediately.");
    }

    @PostMapping("/schedule")
    public ResponseEntity<String> scheduleEmail(
            @RequestBody EmailRequest request,
            @RequestParam LocalDateTime scheduleTime) {

        ZonedDateTime utcTime = ZonedDateTime.of(scheduleTime, ZoneId.systemDefault()).withZoneSameInstant(ZoneOffset.UTC);

        JobDetail jobDetail = JobBuilder.newJob(EmailJob.class)
                .withIdentity("email-" + UUID.randomUUID())
                .usingJobData("to", String.join(",", request.to()))
                .usingJobData("subject", request.subject())
                .usingJobData("body", request.body())
                .build();

        Trigger trigger = TriggerBuilder.newTrigger()
                .withIdentity("trigger-" + UUID.randomUUID())
                .startAt(Date.from(utcTime.toInstant()))
                .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                        .withMisfireHandlingInstructionFireNow())
                .build();

        try {
            scheduler.scheduleJob(jobDetail, trigger);
            return ResponseEntity.accepted().body("Email scheduled for: " + utcTime + " UTC");
        } catch (SchedulerException e) {
            return ResponseEntity.internalServerError().body("Scheduler failed: " + e.getMessage());
        }
    }

    @PostMapping("/broadcast")
    public ResponseEntity<String> broadcastToSelected(
            @RequestBody EmailRequest request,
            @RequestHeader("X-User-Id") UUID userId) {

        List<Contact> selectedContacts = contactService.getSelectedContacts(userId);

        if (selectedContacts.isEmpty()) {
            return ResponseEntity.badRequest().body("No contacts selected for this user.");
        }

        for (Contact contact : selectedContacts) {
            // FIX: Pass null for cc/bcc as broadcasts usually don't involve them
            EmailMessage message = new EmailMessage(
                    List.of(contact.getEmail()),
                    null,
                    null,
                    request.subject(),
                    request.body()
            );

            rabbitTemplate.convertAndSend(
                    RabbitConfig.EXCHANGE,
                    RabbitConfig.ROUTING_KEY,
                    message
            );
        }

        return ResponseEntity.accepted().body("Broadcasting to " + selectedContacts.size() + " contacts.");
    }
}