package com.em.emily.analytics.repository;

import com.em.emily.analytics.EmailEventType;
import com.em.emily.analytics.model.EmailAnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailAnalyticsEventRepository extends JpaRepository<EmailAnalyticsEvent, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT e.emailId) FROM EmailAnalyticsEvent e WHERE e.eventType = :eventType")
    long countDistinctEmailIdByEventType(@org.springframework.data.repository.query.Param("eventType") EmailEventType eventType);
}
