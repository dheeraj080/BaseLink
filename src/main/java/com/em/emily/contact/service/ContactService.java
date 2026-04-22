package com.em.emily.contact.service;

import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.entity.Selected;
import com.em.emily.contact.repository.ContactRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.*;
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

    public Contact createContact(Contact contact) {
        return contactRepository.save(contact);
    }

    public List<Contact> createContacts(List<Contact> contacts) {
        return contactRepository.saveAll(contacts);
    }

    @Transactional
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
                        .sendTo(Selected.NO)
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
    public void toggleSelection(UUID id, boolean selected) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        contact.setSendTo(selected ? Selected.YES : Selected.NO);
        contactRepository.save(contact);
    }

    public List<Contact> getAllUserContacts(UUID userId) {
        return contactRepository.findByUserId(userId);
    }

    public List<Contact> getSelectedContacts(UUID userId) {
        return contactRepository.findByUserIdAndSendTo(userId, Selected.YES);
    }

    public Contact updateContact(UUID id, Contact details) {
        Contact existing = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        existing.setName(details.getName());
        existing.setEmail(details.getEmail());
        existing.setPhoneNo(details.getPhoneNo());
        existing.setDescription(details.getDescription());

        return contactRepository.save(existing);
    }

    @Transactional
    public void bulkSelect(List<UUID> ids, boolean selected) {
        Selected status = selected ? Selected.YES : Selected.NO;
        contactRepository.updateBulkSelection(ids, status);
    }

    public void deleteContact(UUID id) {
        contactRepository.deleteById(id);
    }
}