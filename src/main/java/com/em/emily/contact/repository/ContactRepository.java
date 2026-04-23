package com.em.emily.contact.repository;

import com.em.emily.contact.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ContactRepository extends JpaRepository<Contact, UUID> {

    List<Contact> findByUserId(UUID userId);

    List<Contact> findByUserIdAndSelected(UUID userId, boolean selected);

    @Modifying
    @Query("UPDATE Contact c SET c.selected = :status WHERE c.id IN :ids")
    void updateBulkSelection(List<UUID> ids, boolean status);
}