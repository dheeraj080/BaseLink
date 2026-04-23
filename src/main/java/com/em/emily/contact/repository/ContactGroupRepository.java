package com.em.emily.contact.repository;

import com.em.emily.contact.entity.ContactGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContactGroupRepository extends JpaRepository<ContactGroup, UUID> {
    List<ContactGroup> findByUserId(UUID userId);
}
