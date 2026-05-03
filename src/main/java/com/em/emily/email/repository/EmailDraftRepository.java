package com.em.emily.email.repository;

import com.em.emily.email.model.EmailDraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailDraftRepository extends JpaRepository<EmailDraft, Long> {
    List<EmailDraft> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}
