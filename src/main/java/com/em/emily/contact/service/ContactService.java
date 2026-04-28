package com.em.emily.contact.service;

import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.repository.ContactRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;

    @Caching(evict = {
        @CacheEvict(value = "contacts", key = "#contact.userId"),
        @CacheEvict(value = "selected_contacts", key = "#contact.userId")
    })
    public Contact createContact(Contact contact) {
        return contactRepository.save(contact);
    }

    @Caching(evict = {
        @CacheEvict(value = "contacts", allEntries = true),
        @CacheEvict(value = "selected_contacts", allEntries = true)
    })
    public List<Contact> createContacts(List<Contact> contacts) {
        return contactRepository.saveAll(contacts);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "contacts", key = "#userId"),
        @CacheEvict(value = "selected_contacts", key = "#userId")
    })
    public List<Contact> uploadCsv(MultipartFile file, UUID userId) throws IOException {
        if (file.isEmpty()) throw new RuntimeException("File is empty");

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build();

        List<Contact> contacts = new ArrayList<>();

        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader, format)) {

            Map<String, Integer> headerMap = csvParser.getHeaderMap();
            if (!headerMap.containsKey("Name") || !headerMap.containsKey("Email")) {
                throw new RuntimeException("CSV missing required headers: Name or Email");
            }

            for (CSVRecord csvRecord : csvParser) {
                String email = csvRecord.get("Email");
                if (email == null || email.isBlank()) continue;

                Contact contact = Contact.builder()
                        .name(csvRecord.get("Name"))
                        .email(email)
                        .phoneNo(csvRecord.isMapped("Phone") ? csvRecord.get("Phone") : null)
                        .description(csvRecord.isMapped("Description") ? csvRecord.get("Description") : null)
                        .userId(userId)
                        .selected(false)
                        .build();
                contacts.add(contact);
            }
        }
        return contactRepository.saveAll(contacts);
    }

    public byte[] exportContactsToCsv(UUID userId) {
        List<Contact> contacts = contactRepository.findByUserId(userId);
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader("Name", "Email", "Phone", "Description")
                .build();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), format)) {

            for (Contact contact : contacts) {
                csvPrinter.printRecord(
                        contact.getName(),
                        contact.getEmail(),
                        contact.getPhoneNo(),
                        contact.getDescription()
                );
            }
            csvPrinter.flush();
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to export CSV: " + e.getMessage());
        }
    }

    // NEW METHOD: This makes your PATCH /selection endpoint work
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "contacts", allEntries = true),
        @CacheEvict(value = "selected_contacts", allEntries = true)
    })
    public void toggleSelection(UUID id, boolean selected) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        contact.setSelected(selected);
        contactRepository.save(contact);
    }

    @Cacheable(value = "contacts", key = "#userId")
    public List<Contact> getAllUserContacts(UUID userId) {
        return contactRepository.findByUserId(userId);
    }

    @Cacheable(value = "selected_contacts", key = "#userId")
    public List<Contact> getSelectedContacts(UUID userId) {
        return contactRepository.findByUserIdAndSelected(userId, true);
    }

    @Caching(evict = {
        @CacheEvict(value = "contacts", allEntries = true),
        @CacheEvict(value = "selected_contacts", allEntries = true)
    })
    public Contact updateContact(UUID id, Contact details) {
        Contact existing = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        existing.setName(details.getName());
        existing.setEmail(details.getEmail());
        existing.setPhoneNo(details.getPhoneNo());
        existing.setDescription(details.getDescription());
        existing.setGroups(details.getGroups());

        return contactRepository.save(existing);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "contacts", allEntries = true),
        @CacheEvict(value = "selected_contacts", allEntries = true)
    })
    public void bulkSelect(List<UUID> ids, boolean selected) {
        contactRepository.updateBulkSelection(ids, selected);
    }

    @Caching(evict = {
        @CacheEvict(value = "contacts", allEntries = true),
        @CacheEvict(value = "selected_contacts", allEntries = true)
    })
    public void deleteContact(UUID id) {
        contactRepository.deleteById(id);
    }
}