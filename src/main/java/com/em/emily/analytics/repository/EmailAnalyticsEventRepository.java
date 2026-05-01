package com.em.emily.analytics.repository;

import com.em.emily.analytics.EmailEventType;
import com.em.emily.analytics.model.EmailAnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailAnalyticsEventRepository extends JpaRepository<EmailAnalyticsEvent, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT e.emailId) FROM EmailAnalyticsEvent e WHERE e.eventType = :eventType")
    long countDistinctEmailIdByEventType(@org.springframework.data.repository.query.Param("eventType") EmailEventType eventType);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT e.emailId) FROM EmailAnalyticsEvent e WHERE e.eventType = :eventType AND e.emailId IN :emailIds")
    long countDistinctEmailIdByEventTypeAndEmailIdIn(
            @org.springframework.data.repository.query.Param("eventType") EmailEventType eventType,
            @org.springframework.data.repository.query.Param("emailIds") java.util.List<Long> emailIds);
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT e.emailId) FROM EmailAnalyticsEvent e WHERE e.eventType = :eventType AND e.recipient = :recipient")
    long countDistinctEmailIdByEventTypeAndRecipient(
            @org.springframework.data.repository.query.Param("eventType") EmailEventType eventType,
            @org.springframework.data.repository.query.Param("recipient") String recipient);

    java.util.List<EmailAnalyticsEvent> findByEmailIdIn(java.util.List<Long> emailIds);
}
