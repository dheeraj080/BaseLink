package com.em.emily.email.repository;

import com.em.emily.email.model.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmailRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findByUserId(UUID userId);

    @org.springframework.data.jpa.repository.Query("SELECT e.id FROM EmailLog e WHERE e.userId = :userId")
    List<Long> findIdsByUserId(@org.springframework.data.repository.query.Param("userId") UUID userId);
    @org.springframework.data.jpa.repository.Query("SELECT e.id FROM EmailLog e WHERE e.userId = :userId AND e.subject = :subject")
    List<Long> findIdsByUserIdAndSubject(
            @org.springframework.data.repository.query.Param("userId") UUID userId, 
            @org.springframework.data.repository.query.Param("subject") String subject);
}