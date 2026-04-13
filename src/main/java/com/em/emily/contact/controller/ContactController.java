package com.em.emily.contact.controller;

import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<Contact> create(@Valid @RequestBody Contact contact) {
        return ResponseEntity.ok(contactService.createContact(contact));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Contact>> createMultiple(@Valid @RequestBody List<Contact> contacts) {
        return ResponseEntity.ok(contactService.createContacts(contacts));
    }

    @PostMapping("/upload")
    public ResponseEntity<List<Contact>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") UUID userId) throws IOException {

        return ResponseEntity.ok(contactService.uploadCsv(file, userId));
    }

    @GetMapping("/export/{userId}")
    public ResponseEntity<byte[]> exportCsv(@PathVariable UUID userId) {
        byte[] data = contactService.exportContactsToCsv(userId);

        String filename = "contacts_" + userId + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Contact>> getContacts(
            @PathVariable UUID userId,
            @RequestParam(value = "onlySelected", defaultValue = "false") boolean onlySelected) {

        if (onlySelected) {
            return ResponseEntity.ok(contactService.getSelectedContacts(userId));
        }
        return ResponseEntity.ok(contactService.getAllUserContacts(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> update(@PathVariable UUID id, @RequestBody Contact contact) {
        return ResponseEntity.ok(contactService.updateContact(id, contact));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}