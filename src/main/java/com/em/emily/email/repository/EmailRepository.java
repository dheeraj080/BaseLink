package com.em.emily.email.repository;

import com.em.emily.email.model.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailRepository extends JpaRepository<EmailLog, Long> {
}