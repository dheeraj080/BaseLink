package com.em.emily.analytics.service;

import com.em.emily.analytics.EmailEventType;
import com.em.emily.analytics.dto.AnalyticsStatsDto;
import com.em.emily.analytics.model.EmailAnalyticsEvent;
import com.em.emily.analytics.repository.EmailAnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EmailAnalyticsEventRepository repository;
    private final com.em.emily.email.repository.EmailRepository emailRepository;

    @Transactional
    public void recordEvent(Long emailId, EmailEventType eventType, String recipient) {
        EmailAnalyticsEvent event = EmailAnalyticsEvent.builder()
                .emailId(emailId)
                .eventType(eventType)
                .recipient(recipient)
                .timestamp(LocalDateTime.now())
                .build();
        repository.save(event);
    }

    @Async
    @EventListener
    @Transactional
    public void onEmailSent(com.em.emily.email.EmailSentEvent event) {
        recordEvent(event.emailId(), EmailEventType.SENT, event.recipient());
        // Automatically mark as DELIVERED for standard analytics tracking purposes
        recordEvent(event.emailId(), EmailEventType.DELIVERED, event.recipient());
    }

    @Transactional(readOnly = true)
    public AnalyticsStatsDto getStats(java.util.UUID userId, String subject) {
        if (userId == null) {
            return AnalyticsStatsDto.builder().build();
        }
        
        java.util.List<Long> emailIds;
        if (subject != null && !subject.equalsIgnoreCase("all")) {
            emailIds = emailRepository.findIdsByUserIdAndSubject(userId, subject);
        } else {
            emailIds = emailRepository.findIdsByUserId(userId);
        }
        
        if (emailIds == null || emailIds.isEmpty()) {
            return AnalyticsStatsDto.builder().build();
        }

        long sent = repository.countDistinctEmailIdByEventTypeAndEmailIdIn(EmailEventType.SENT, emailIds);
        long delivered = repository.countDistinctEmailIdByEventTypeAndEmailIdIn(EmailEventType.DELIVERED, emailIds);
        long opened = repository.countDistinctEmailIdByEventTypeAndEmailIdIn(EmailEventType.OPENED, emailIds);
        long clicked = repository.countDistinctEmailIdByEventTypeAndEmailIdIn(EmailEventType.CLICKED, emailIds);
        long unsubscribed = repository.countDistinctEmailIdByEventTypeAndEmailIdIn(EmailEventType.UNSUBSCRIBED, emailIds);
        long bounced = repository.countDistinctEmailIdByEventTypeAndEmailIdIn(EmailEventType.BOUNCED, emailIds);
        long spam = repository.countDistinctEmailIdByEventTypeAndEmailIdIn(EmailEventType.SPAM_COMPLAINT, emailIds);
        long replied = repository.countDistinctEmailIdByEventTypeAndEmailIdIn(EmailEventType.REPLIED, emailIds);

        double openRate = delivered > 0 ? ((double) opened / delivered) * 100 : 0.0;
        double ctr = sent > 0 ? ((double) clicked / sent) * 100 : 0.0;
        double ctor = opened > 0 ? ((double) clicked / opened) * 100 : 0.0;
        double unsubscribeRate = delivered > 0 ? ((double) unsubscribed / delivered) * 100 : 0.0;
        double bounceRate = sent > 0 ? ((double) bounced / sent) * 100 : 0.0;
        double deliveryRate = sent > 0 ? ((double) delivered / sent) * 100 : 0.0;
        double spamComplaintRate = delivered > 0 ? ((double) spam / delivered) * 100 : 0.0;
        double replyRate = delivered > 0 ? ((double) replied / delivered) * 100 : 0.0;

        // Round to 2 decimal places
        openRate = Math.round(openRate * 100.0) / 100.0;
        ctr = Math.round(ctr * 100.0) / 100.0;
        ctor = Math.round(ctor * 100.0) / 100.0;
        unsubscribeRate = Math.round(unsubscribeRate * 100.0) / 100.0;
        bounceRate = Math.round(bounceRate * 100.0) / 100.0;
        deliveryRate = Math.round(deliveryRate * 100.0) / 100.0;
        spamComplaintRate = Math.round(spamComplaintRate * 100.0) / 100.0;
        replyRate = Math.round(replyRate * 100.0) / 100.0;

        return AnalyticsStatsDto.builder()
                .totalSent(sent)
                .totalDelivered(delivered)
                .totalOpened(opened)
                .totalClicked(clicked)
                .totalUnsubscribed(unsubscribed)
                .totalBounced(bounced)
                .totalSpamComplaints(spam)
                .totalReplied(replied)
                .openRate(openRate)
                .clickThroughRate(ctr)
                .clickToOpenRate(ctor)
                .unsubscribeRate(unsubscribeRate)
                .bounceRate(bounceRate)
                .deliveryRate(deliveryRate)
                .spamComplaintRate(spamComplaintRate)
                .replyRate(replyRate)
                .build();
    }

    @Transactional(readOnly = true)
    public AnalyticsStatsDto getStats(java.util.UUID userId) {
        return getStats(userId, null);
    }
    @Transactional(readOnly = true)
    public AnalyticsStatsDto getStatsForContact(String email) {
        if (email == null || email.isBlank()) {
            return AnalyticsStatsDto.builder().build();
        }

        long sent = repository.countDistinctEmailIdByEventTypeAndRecipient(EmailEventType.SENT, email);
        long delivered = repository.countDistinctEmailIdByEventTypeAndRecipient(EmailEventType.DELIVERED, email);
        long opened = repository.countDistinctEmailIdByEventTypeAndRecipient(EmailEventType.OPENED, email);
        long clicked = repository.countDistinctEmailIdByEventTypeAndRecipient(EmailEventType.CLICKED, email);
        long unsubscribed = repository.countDistinctEmailIdByEventTypeAndRecipient(EmailEventType.UNSUBSCRIBED, email);
        long bounced = repository.countDistinctEmailIdByEventTypeAndRecipient(EmailEventType.BOUNCED, email);
        long spam = repository.countDistinctEmailIdByEventTypeAndRecipient(EmailEventType.SPAM_COMPLAINT, email);
        long replied = repository.countDistinctEmailIdByEventTypeAndRecipient(EmailEventType.REPLIED, email);

        double openRate = delivered > 0 ? ((double) opened / delivered) * 100 : 0.0;
        double ctr = sent > 0 ? ((double) clicked / sent) * 100 : 0.0;
        double ctor = opened > 0 ? ((double) clicked / opened) * 100 : 0.0;
        double unsubscribeRate = delivered > 0 ? ((double) unsubscribed / delivered) * 100 : 0.0;
        double bounceRate = sent > 0 ? ((double) bounced / sent) * 100 : 0.0;
        double deliveryRate = sent > 0 ? ((double) delivered / sent) * 100 : 0.0;
        double spamComplaintRate = delivered > 0 ? ((double) spam / delivered) * 100 : 0.0;
        double replyRate = delivered > 0 ? ((double) replied / delivered) * 100 : 0.0;

        // Round to 2 decimal places
        openRate = Math.round(openRate * 100.0) / 100.0;
        ctr = Math.round(ctr * 100.0) / 100.0;
        ctor = Math.round(ctor * 100.0) / 100.0;
        unsubscribeRate = Math.round(unsubscribeRate * 100.0) / 100.0;
        bounceRate = Math.round(bounceRate * 100.0) / 100.0;
        deliveryRate = Math.round(deliveryRate * 100.0) / 100.0;
        spamComplaintRate = Math.round(spamComplaintRate * 100.0) / 100.0;
        replyRate = Math.round(replyRate * 100.0) / 100.0;

        return AnalyticsStatsDto.builder()
                .totalSent(sent)
                .totalDelivered(delivered)
                .totalOpened(opened)
                .totalClicked(clicked)
                .totalUnsubscribed(unsubscribed)
                .totalBounced(bounced)
                .totalSpamComplaints(spam)
                .totalReplied(replied)
                .openRate(openRate)
                .clickThroughRate(ctr)
                .clickToOpenRate(ctor)
                .unsubscribeRate(unsubscribeRate)
                .bounceRate(bounceRate)
                .deliveryRate(deliveryRate)
                .spamComplaintRate(spamComplaintRate)
                .replyRate(replyRate)
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<com.em.emily.analytics.dto.TimelinePointDto> getTimelineStats(java.util.UUID userId, String subject) {
        if (userId == null) {
            return java.util.Collections.emptyList();
        }
        
        java.util.List<Long> emailIds;
        if (subject != null && !subject.equalsIgnoreCase("all")) {
            emailIds = emailRepository.findIdsByUserIdAndSubject(userId, subject);
        } else {
            emailIds = emailRepository.findIdsByUserId(userId);
        }
        
        if (emailIds == null || emailIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        java.util.List<EmailAnalyticsEvent> events = repository.findByEmailIdIn(emailIds);
        java.util.Map<java.time.LocalDate, com.em.emily.analytics.dto.TimelinePointDto> map = new java.util.TreeMap<>();
        
        for (EmailAnalyticsEvent event : events) {
            java.time.LocalDate date = event.getTimestamp().toLocalDate();
            com.em.emily.analytics.dto.TimelinePointDto point = map.computeIfAbsent(date, d -> 
                com.em.emily.analytics.dto.TimelinePointDto.builder().date(d).build());
            
            if (event.getEventType() != null) {
                switch (event.getEventType()) {
                    case SENT -> point.setSent(point.getSent() + 1);
                    case OPENED -> point.setOpens(point.getOpens() + 1);
                    case CLICKED -> point.setClicks(point.getClicks() + 1);
                    case UNSUBSCRIBED -> point.setUnsubscribed(point.getUnsubscribed() + 1);
                }
            }
        }
        return new java.util.ArrayList<>(map.values());
    }
}
