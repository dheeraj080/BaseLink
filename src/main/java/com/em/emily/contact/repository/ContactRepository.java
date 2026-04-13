package com.em.emily.contact.repository;

import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.entity.Selected;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContactRepository extends JpaRepository<Contact, UUID> {

    List<Contact> findByUserId(UUID userId);
    Optional<Contact> findByIdAndUserId(UUID id, UUID userId);
    List<Contact> findByUserIdAndSendTo(UUID userId, Selected sendTo);
}
