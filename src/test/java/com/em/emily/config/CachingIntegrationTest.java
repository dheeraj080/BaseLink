package com.em.emily.config;

import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.repository.ContactRepository;
import com.em.emily.contact.service.ContactService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "security.jwt.secret=9a67473d4644440a76be0488f7832811293290626b382d6b380302d9600e12345",
        "security.jwt.access-ttl-seconds=3600",
        "security.jwt.refresh-ttl-seconds=2592000",
        "security.jwt.issuer=emily-auth-test",
        "spring.security.oauth2.client.registration.google.client-id=mock-id",
        "spring.security.oauth2.client.registration.google.client-secret=mock-secret"
})
@ActiveProfiles("test")
public class CachingIntegrationTest {

    @Autowired
    private ContactService contactService;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private CacheManager cacheManager;

    @Test
    public void testContactCaching() {
        UUID userId = UUID.randomUUID();

        // 1. Initial call populates the cache
        contactService.getAllUserContacts(userId);
        
        // Assert cache contains the entry
        assertThat(cacheManager.getCache("contacts").get(userId)).isNotNull();

        // 2. Clear cache implicitly by adding a new contact
        Contact newContact = new Contact();
        newContact.setUserId(userId);
        newContact.setName("Test Caching");
        newContact.setEmail("caching@test.com");
        
        contactService.createContact(newContact);

        // Assert cache is evicted
        assertThat(cacheManager.getCache("contacts").get(userId)).isNull();
    }
}
