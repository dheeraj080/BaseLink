package com.em.emily.contact.repository;

import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.entity.Selected;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ContactRepository extends JpaRepository<Contact, UUID> {

    List<Contact> findByUserId(UUID userId);

    List<Contact> findByUserIdAndSendTo(UUID userId, Selected sendTo);

    @Modifying
    @Query("UPDATE Contact c SET c.sendTo = :status WHERE c.id IN :ids")
    void updateBulkSelection(List<UUID> ids, Selected status);
}