package com.em.emily.email.repository;

import com.em.emily.email.model.EmailConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailConfigRepository extends JpaRepository<EmailConfig, UUID> {
    Optional<EmailConfig> findByUserIdAndIsActiveTrue(UUID userId);
    Optional<EmailConfig> findByUserId(UUID userId);
}
