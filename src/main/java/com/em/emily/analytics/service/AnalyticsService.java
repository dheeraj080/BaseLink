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
    public AnalyticsStatsDto getStats() {
        long sent = repository.countDistinctEmailIdByEventType(EmailEventType.SENT);
        long delivered = repository.countDistinctEmailIdByEventType(EmailEventType.DELIVERED);
        long opened = repository.countDistinctEmailIdByEventType(EmailEventType.OPENED);
        long clicked = repository.countDistinctEmailIdByEventType(EmailEventType.CLICKED);
        long unsubscribed = repository.countDistinctEmailIdByEventType(EmailEventType.UNSUBSCRIBED);
        long bounced = repository.countDistinctEmailIdByEventType(EmailEventType.BOUNCED);
        long spam = repository.countDistinctEmailIdByEventType(EmailEventType.SPAM_COMPLAINT);

        double openRate = delivered > 0 ? ((double) opened / delivered) * 100 : 0.0;
        double ctr = sent > 0 ? ((double) clicked / sent) * 100 : 0.0;
        double ctor = opened > 0 ? ((double) clicked / opened) * 100 : 0.0;
        double unsubscribeRate = delivered > 0 ? ((double) unsubscribed / delivered) * 100 : 0.0;
        double bounceRate = sent > 0 ? ((double) bounced / sent) * 100 : 0.0;
        double deliveryRate = sent > 0 ? ((double) delivered / sent) * 100 : 0.0;
        double spamComplaintRate = delivered > 0 ? ((double) spam / delivered) * 100 : 0.0;

        // Round to 2 decimal places
        openRate = Math.round(openRate * 100.0) / 100.0;
        ctr = Math.round(ctr * 100.0) / 100.0;
        ctor = Math.round(ctor * 100.0) / 100.0;
        unsubscribeRate = Math.round(unsubscribeRate * 100.0) / 100.0;
        bounceRate = Math.round(bounceRate * 100.0) / 100.0;
        deliveryRate = Math.round(deliveryRate * 100.0) / 100.0;
        spamComplaintRate = Math.round(spamComplaintRate * 100.0) / 100.0;

        return AnalyticsStatsDto.builder()
                .totalSent(sent)
                .totalDelivered(delivered)
                .totalOpened(opened)
                .totalClicked(clicked)
                .totalUnsubscribed(unsubscribed)
                .totalBounced(bounced)
                .totalSpamComplaints(spam)
                .openRate(openRate)
                .clickThroughRate(ctr)
                .clickToOpenRate(ctor)
                .unsubscribeRate(unsubscribeRate)
                .bounceRate(bounceRate)
                .deliveryRate(deliveryRate)
                .spamComplaintRate(spamComplaintRate)
                .build();
    }
}
