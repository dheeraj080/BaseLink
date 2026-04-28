package com.em.emily.contact.service;

import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.entity.ContactGroup;
import com.em.emily.contact.repository.ContactGroupRepository;
import com.em.emily.contact.repository.ContactRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactGroupService {

    private final ContactGroupRepository groupRepository;
    private final ContactRepository contactRepository;

    public ContactGroup createGroup(ContactGroup group) {
        return groupRepository.save(group);
    }

    public List<ContactGroup> getUserGroups(UUID userId) {
        return groupRepository.findByUserId(userId);
    }

    @Transactional
    public void addSelectedToGroup(UUID groupId, UUID userId) {
        ContactGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You do not own this group");
        }

        List<Contact> selectedContacts = contactRepository.findByUserIdAndSelected(userId, true);

        for (Contact contact : selectedContacts) {
            contact.getGroups().add(group);
        }
        
        contactRepository.saveAll(selectedContacts);
    }

    public ContactGroup updateGroup(UUID id, ContactGroup details) {
        ContactGroup existing = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        existing.setName(details.getName());
        existing.setDescription(details.getDescription());
        return groupRepository.save(existing);
    }

    public void deleteGroup(UUID id) {
        groupRepository.deleteById(id);
    }
}
