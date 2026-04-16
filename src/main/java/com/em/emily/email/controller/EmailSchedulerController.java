package com.em.emily.email.controller;

import com.em.emily.email.payload.EmailRequest;
import com.em.emily.email.payload.EmailResponse;
import com.em.emily.email.quartz.EmailJob;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/emails")
@RequiredArgsConstructor
public class EmailSchedulerController {

    private final Scheduler scheduler;

    @PostMapping("/schedule")
    public ResponseEntity<EmailResponse> scheduleEmail(@Valid @RequestBody EmailRequest emailRequest) {
        try {
            if (emailRequest.getDateTime() == null || emailRequest.getTimeZone() == null) {
                return ResponseEntity.badRequest()
                        .body(new EmailResponse(false, "dateTime and timeZone are required"));
            }

            ZonedDateTime scheduledDateTime =
                    ZonedDateTime.of(emailRequest.getDateTime(), ZoneId.of(emailRequest.getTimeZone()));

            ZonedDateTime now = ZonedDateTime.now(ZoneId.of(emailRequest.getTimeZone()));

            if (scheduledDateTime.isBefore(now)) {
                return ResponseEntity.badRequest()
                        .body(new EmailResponse(false, "dateTime must be in the future"));
            }

            JobDetail jobDetail = buildJobDetail(emailRequest);
            Trigger trigger = buildTrigger(jobDetail, scheduledDateTime);

            scheduler.scheduleJob(jobDetail, trigger);

            EmailResponse response = new EmailResponse(
                    true,
                    jobDetail.getKey().getName(),
                    jobDetail.getKey().getGroup(),
                    "Email scheduled successfully"
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error scheduling email", e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new EmailResponse(false, "Error scheduling email"));
        }
    }

    private JobDetail buildJobDetail(EmailRequest request) {
        JobDataMap jobDataMap = new JobDataMap();
        jobDataMap.put("email", request.getEmail());
        jobDataMap.put("subject", request.getSubject());
        jobDataMap.put("body", request.getBody());

        return JobBuilder.newJob(EmailJob.class)
                .withIdentity(UUID.randomUUID().toString(), "email-jobs")
                .usingJobData(jobDataMap)
                .storeDurably()
                .build();
    }

    private Trigger buildTrigger(JobDetail jobDetail, ZonedDateTime startAt) {
        return TriggerBuilder.newTrigger()
                .forJob(jobDetail)
                .withIdentity(jobDetail.getKey().getName(), "email-triggers")
                .startAt(Date.from(startAt.toInstant()))
                .withSchedule(
                        SimpleScheduleBuilder.simpleSchedule()
                                .withMisfireHandlingInstructionFireNow()
                )
                .build();
    }
}