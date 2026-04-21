package com.em.emily.email.quartz;

import org.quartz.*;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JobScheduler {

    private final Scheduler scheduler;

    public JobScheduler(Scheduler scheduler) {
        this.scheduler = scheduler;
    }

    public void scheduleEmail(List<String> to, String subject, String body, ZonedDateTime dateTime) {
        if (to == null || to.isEmpty()) {
            throw new IllegalArgumentException("Recipient list cannot be null or empty.");
        }
        
        try {
            String recipients = String.join(",", to);

            JobDetail jobDetail = JobBuilder.newJob(EmailJob.class)
                    .withIdentity(UUID.randomUUID().toString(), "email-jobs")
                    .usingJobData("to", recipients) // Save as String
                    .usingJobData("subject", subject)
                    .usingJobData("body", body)
                    .build();

            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(jobDetail.getKey().getName(), "email-triggers")
                    .startAt(Date.from(dateTime.toInstant()))
                    .withSchedule(SimpleScheduleBuilder.simpleSchedule())
                    .build();

            scheduler.scheduleJob(jobDetail, trigger);
        } catch (SchedulerException e) {
            throw new RuntimeException("Error scheduling email", e);
        }
    }
}