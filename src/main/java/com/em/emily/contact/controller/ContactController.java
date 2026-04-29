package com.em.emily.contact.controller;

import com.em.emily.auth.UserPrincipal;
import com.em.emily.contact.dto.BulkSelectionRequest;
import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;

    @PostMapping
    public ResponseEntity<Contact> create(@Valid @RequestBody Contact contact,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        // FIX: Manually assign the userId from the principal before saving
        contact.setUserId(principal.id());
        return ResponseEntity.ok(contactService.createContact(contact));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Contact>> createMultiple(@Valid @RequestBody List<Contact> contacts,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        // FIX: Ensure all contacts in the list get the userId assigned
        contacts.forEach(contact -> contact.setUserId(principal.id()));
        return ResponseEntity.ok(contactService.createContacts(contacts));
    }

    @PostMapping("/upload")
    public ResponseEntity<List<Contact>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {

        return ResponseEntity.ok(contactService.uploadCsv(file, principal.id()));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(@AuthenticationPrincipal UserPrincipal principal) {
        byte[] data = contactService.exportContactsToCsv(principal.id());
        String filename = "contacts_" + principal.id() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    @GetMapping
    public ResponseEntity<List<Contact>> getContacts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "onlySelected", defaultValue = "false") boolean onlySelected) {

        if (onlySelected) {
            return ResponseEntity.ok(contactService.getSelectedContacts(principal.id()));
        }
        return ResponseEntity.ok(contactService.getAllUserContacts(principal.id()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> update(@PathVariable UUID id,
                                          @RequestBody Contact contact,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        // Ensure the updated contact belongs to the user
        contact.setUserId(principal.id());
        return ResponseEntity.ok(contactService.updateContact(id, contact));
    }

    @PostMapping("/bulk-selection")
    public ResponseEntity<Void> bulkSelect(
            @RequestBody BulkSelectionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        // Optional: Add logic here to ensure the IDs provided belong to the requesting userId
        contactService.bulkSelect(request.contactIds(), request.selected());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/selection")
    public ResponseEntity<Void> toggleSelection(
            @PathVariable UUID id,
            @RequestParam boolean selected,
            @AuthenticationPrincipal UserPrincipal principal) {

        contactService.toggleSelection(id, selected);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/broadcast")
    public ResponseEntity<String> broadcastToSelected(
            @RequestBody com.em.emily.email.EmailRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        System.out.println("DEBUG: broadcastToSelected called!");
        System.out.println("DEBUG: request payload -> " + request);

        List<String> recipients = request.to();
        System.out.println("DEBUG: Recipients list extracted -> " + recipients);

        if (recipients == null || recipients.isEmpty()) {
            System.out.println("DEBUG: No explicit recipients provided. Attempting to fall back to selected contacts...");
            List<Contact> selectedContacts = contactService.getSelectedContacts(principal.id());
            System.out.println("DEBUG: Database selected contacts count -> " + (selectedContacts != null ? selectedContacts.size() : 0));
            
            if (selectedContacts == null || selectedContacts.isEmpty()) {
                System.out.println("DEBUG: Fallback failed. Both payload and database recipients are EMPTY. Returning 400.");
                return ResponseEntity.badRequest().body("No recipients specified and no contacts selected for this user.");
            }
            recipients = selectedContacts.stream().map(Contact::getEmail).toList();
        }

        System.out.println("DEBUG: Processing broadcast for " + recipients.size() + " total recipients.");

        for (String email : recipients) {
            com.em.emily.email.EmailRequest message = new com.em.emily.email.EmailRequest(
                    List.of(email),
                    request.cc(),
                    request.bcc(),
                    request.replyTo(),
                    request.subject(),
                    request.body(),
                    principal.id()
            );

            rabbitTemplate.convertAndSend(
                    com.em.emily.email.config.RabbitConfig.EXCHANGE,
                    com.em.emily.email.config.RabbitConfig.ROUTING_KEY,
                    message
            );
        }

        System.out.println("DEBUG: Successfully queued messages. Returning 202.");
        return ResponseEntity.accepted().body("Broadcasting to " + recipients.size() + " contacts.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }
}