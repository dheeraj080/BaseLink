package com.em.emily.contact.service;

import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.entity.Selected;
import com.em.emily.contact.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
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

    public List<Contact> uploadCsv(MultipartFile file, UUID userId) throws IOException {
        List<Contact> contacts = new ArrayList<>();

        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), "UTF-8"));
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())) {

            Iterable<CSVRecord> csvRecords = csvParser.getRecords();

            for (CSVRecord csvRecord : csvRecords) {
                Contact contact = Contact.builder()
                        .name(csvRecord.get("Name"))
                        .email(csvRecord.get("Email"))
                        .phoneNo(csvRecord.get("Phone"))
                        .description(csvRecord.get("Description"))
                        .userId(userId) // Assign to the current user
                        .sendTo(Selected.NO)
                        .build();
                contacts.add(contact);
            }
        }
        return contactRepository.saveAll(contacts);
    }

    public byte[] exportContactsToCsv(UUID userId) {
        List<Contact> contacts = contactRepository.findByUserId(userId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out),
                     CSVFormat.DEFAULT.withHeader("Name", "Email", "Phone", "Description"))) {

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

    public void deleteContact(UUID id) {
        contactRepository.deleteById(id);
    }
}