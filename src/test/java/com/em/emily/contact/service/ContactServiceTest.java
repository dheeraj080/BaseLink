package com.em.emily.contact.service;

import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.repository.ContactRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    private ContactService contactService;

    private UUID userId;
    private Contact contact;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        contact = Contact.builder()
                .id(UUID.randomUUID())
                .name("John Doe")
                .email("john@example.com")
                .userId(userId)
                .selected(false)
                .build();
    }

    @Test
    void createContact_Success() {
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);
        
        Contact result = contactService.createContact(contact);
        
        assertNotNull(result);
        assertEquals(contact.getEmail(), result.getEmail());
        verify(contactRepository).save(contact);
    }

    @Test
    void uploadCsv_Success() throws IOException {
        String csvContent = "Name,Email,Phone,Description\nJohn Doe,john@example.com,1234567890,Test Desc";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csvContent.getBytes(StandardCharsets.UTF_8));
        
        when(contactRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<Contact> results = contactService.uploadCsv(file, userId);

        assertEquals(1, results.size());
        assertEquals("John Doe", results.get(0).getName());
        assertEquals("john@example.com", results.get(0).getEmail());
        assertEquals(userId, results.get(0).getUserId());
        verify(contactRepository).saveAll(anyList());
    }

    @Test
    void uploadCsv_MissingHeaders_ThrowsException() {
        String csvContent = "Wrong,Header\nValue1,Value2";
        MockMultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv", csvContent.getBytes(StandardCharsets.UTF_8));

        assertThrows(RuntimeException.class, () -> contactService.uploadCsv(file, userId));
    }

    @Test
    void exportContactsToCsv_Success() {
        when(contactRepository.findByUserId(userId)).thenReturn(List.of(contact));

        byte[] csvBytes = contactService.exportContactsToCsv(userId);

        assertNotNull(csvBytes);
        String csvContent = new String(csvBytes, StandardCharsets.UTF_8);
        assertTrue(csvContent.contains("John Doe"));
        assertTrue(csvContent.contains("john@example.com"));
    }

    @Test
    void toggleSelection_Success() {
        UUID contactId = contact.getId();
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(contact));

        contactService.toggleSelection(contactId, true);

        assertTrue(contact.isSelected());
        verify(contactRepository).save(contact);
    }

    @Test
    void toggleSelection_NotFound_ThrowsException() {
        UUID contactId = UUID.randomUUID();
        when(contactRepository.findById(contactId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> contactService.toggleSelection(contactId, true));
    }

    @Test
    void updateContact_Success() {
        UUID contactId = contact.getId();
        Contact updates = Contact.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .build();
        
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any(Contact.class))).thenAnswer(i -> i.getArgument(0));

        Contact result = contactService.updateContact(contactId, updates);

        assertEquals("Jane Doe", result.getName());
        assertEquals("jane@example.com", result.getEmail());
        verify(contactRepository).save(contact);
    }

    @Test
    void deleteContact_Success() {
        UUID contactId = UUID.randomUUID();
        
        contactService.deleteContact(contactId);
        
        verify(contactRepository).deleteById(contactId);
    }
}
