package com.em.emily;

import com.em.emily.auth.UserPrincipal;
import com.em.emily.contact.entity.Contact;
import com.em.emily.contact.repository.ContactRepository;
import com.em.emily.email.EmailRequest;
import com.em.emily.email.model.EmailLog;
import com.em.emily.email.repository.EmailRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.icegreen.greenmail.configuration.GreenMailConfiguration;
import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.ServerSetupTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.mockito.Mockito;
import org.awaitility.Awaitility;
import java.time.Duration;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "security.jwt.secret=9a67473d4644440a76be0488f7832811293290626b382d6b380302d9600e12345",
        "security.jwt.access-ttl-seconds=3600",
        "security.jwt.refresh-ttl-seconds=2592000",
        "security.jwt.issuer=emily-auth-test",
        "spring.security.oauth2.client.registration.google.client-id=mock-id",
        "spring.security.oauth2.client.registration.google.client-secret=mock-secret",
        "spring.mail.properties.mail.smtp.from=no-reply@emily.com"
})
@ActiveProfiles("test")
@WithMockUser // This will provide a default mock user
public class EmIlyIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private EmailRepository emailRepository;

    @TestConfiguration
    static class MockConfig {
        @Bean
        public RabbitTemplate rabbitTemplate() {
            return Mockito.mock(RabbitTemplate.class);
        }

        @Bean
        public ConnectionFactory connectionFactory() {
            return Mockito.mock(ConnectionFactory.class);
        }
    }

    @RegisterExtension
    static GreenMailExtension greenMail = new GreenMailExtension(ServerSetupTest.SMTP)
            .withConfiguration(GreenMailConfiguration.aConfig().withUser("test", "test"))
            .withPerMethodLifecycle(false);

    @DynamicPropertySource
    static void configureMailProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.mail.host", () -> "localhost");
        registry.add("spring.mail.port", () -> greenMail.getSmtp().getPort());
        registry.add("spring.mail.username", () -> "test");
        registry.add("spring.mail.password", () -> "test");
        registry.add("spring.mail.properties.mail.smtp.auth", () -> "true");
        registry.add("spring.mail.properties.mail.smtp.starttls.enable", () -> "false");
    }

    private UUID testUserId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
        testUserId = UUID.fromString("00000000-0000-0000-0000-000000000000");
        contactRepository.deleteAll();
        emailRepository.deleteAll();
    }

    @Test
    void testFullFlow_CreateContactAndSendEmail() throws Exception {
        Contact contact = Contact.builder()
                .name("Alice Wonderland")
                .email("alice@example.com")
                .build();

        UserPrincipal principal = new UserPrincipal(testUserId, "test@example.com");

        mockMvc.perform(post("/api/v1/contacts")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(contact)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk());

        assertThat(contactRepository.count()).isEqualTo(1);

        EmailRequest emailRequest = new EmailRequest(
                List.of("alice@example.com"),
                null,
                null,
                null,
                "Integration Test Subject",
                "Hello Alice, this is an integration test."
        );

        mockMvc.perform(post("/api/v1/email/send")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(principal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emailRequest)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk());

        assertThat(greenMail.waitForIncomingEmail(5000, 1)).isTrue();
        assertThat(greenMail.getReceivedMessages()[0].getSubject()).isEqualTo("Integration Test Subject");

        // Wait for async status update
        Awaitility.await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted(() -> {
                    List<EmailLog> logs = emailRepository.findAll();
                    assertThat(logs).hasSize(1);
                    assertThat(logs.get(0).getStatus().name()).isEqualTo("SENT");
                });
    }

    @Test
    void testContactManagement() throws Exception {
        Contact c1 = Contact.builder().name("User 1").email("u1@test.com").userId(testUserId).build();
        contactRepository.save(c1);

        UserPrincipal principal = new UserPrincipal(testUserId, "test@example.com");

        mockMvc.perform(patch("/api/v1/contacts/" + c1.getId() + "/selection")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(principal))
                        .param("selected", "true"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/contacts")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(principal))
                        .param("onlySelected", "true"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}
