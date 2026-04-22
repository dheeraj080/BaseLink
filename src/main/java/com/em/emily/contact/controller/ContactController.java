package com.em.emily.contact.controller;

import com.em.emily.contact.dto.BulkSelectionRequest;
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
    public ResponseEntity<Contact> create(@Valid @RequestBody Contact contact,
                                          @RequestHeader("X-User-Id") UUID userId) {
        // FIX: Manually assign the userId from the header before saving
        contact.setUserId(userId);
        return ResponseEntity.ok(contactService.createContact(contact));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Contact>> createMultiple(@Valid @RequestBody List<Contact> contacts,
                                                        @RequestHeader("X-User-Id") UUID userId) {
        // FIX: Ensure all contacts in the list get the userId assigned
        contacts.forEach(contact -> contact.setUserId(userId));
        return ResponseEntity.ok(contactService.createContacts(contacts));
    }

    @PostMapping("/upload")
    public ResponseEntity<List<Contact>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-Id") UUID userId) throws IOException { // Changed to RequestHeader

        return ResponseEntity.ok(contactService.uploadCsv(file, userId));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(@RequestHeader("X-User-Id") UUID userId) {
        byte[] data = contactService.exportContactsToCsv(userId);
        String filename = "contacts_" + userId + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    @GetMapping
    public ResponseEntity<List<Contact>> getContacts(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(value = "onlySelected", defaultValue = "false") boolean onlySelected) {

        if (onlySelected) {
            return ResponseEntity.ok(contactService.getSelectedContacts(userId));
        }
        return ResponseEntity.ok(contactService.getAllUserContacts(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> update(@PathVariable UUID id,
                                          @RequestBody Contact contact,
                                          @RequestHeader("X-User-Id") UUID userId) {
        // Ensure the updated contact belongs to the user
        contact.setUserId(userId);
        return ResponseEntity.ok(contactService.updateContact(id, contact));
    }

    @PostMapping("/bulk-selection")
    public ResponseEntity<Void> bulkSelect(
            @RequestBody BulkSelectionRequest request,
            @RequestHeader("X-User-Id") UUID userId) {

        // Optional: Add logic here to ensure the IDs provided belong to the requesting userId
        contactService.bulkSelect(request.contactIds(), request.selected());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/selection")
    public ResponseEntity<Void> toggleSelection(
            @PathVariable UUID id,
            @RequestParam boolean selected,
            @RequestHeader("X-User-Id") UUID userId) {

        contactService.toggleSelection(id, selected);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}