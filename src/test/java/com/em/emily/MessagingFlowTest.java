package com.em.emily;

import com.em.emily.email.consumer.EmailEventListener;
import com.em.emily.email.dto.EmailRequest;
import com.em.emily.email.model.EmailLog;
import com.em.emily.email.repository.EmailRepository;
import com.icegreen.greenmail.configuration.GreenMailConfiguration;
import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.ServerSetupTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.awaitility.Awaitility;
import org.mockito.Mockito;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
public class MessagingFlowTest {

    @Autowired
    private EmailEventListener emailEventListener; // This will be the spy

    @Autowired
    private EmailRepository emailRepository;

    @TestConfiguration
    static class MessagingFlowConfig {
        @Bean
        @Primary
        public EmailEventListener emailEventListenerSpy(EmailEventListener realListener) {
            return Mockito.spy(realListener);
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
    }

    @Test
    void testFlowWhenMessageIsReceived() throws Exception {
        EmailRequest request = new EmailRequest(
                List.of("flow-test@example.com"),
                null,
                null,
                null,
                "Simulated MQ Subject",
                "Testing the listener flow."
        );

        // Manually trigger the listener
        emailEventListener.handleEmailEvent(request);

        // Verify the listener processing
        verify(emailEventListener).handleEmailEvent(request);

        // Verify email delivery
        assertThat(greenMail.waitForIncomingEmail(5000, 1)).isTrue();
        assertThat(greenMail.getReceivedMessages()[0].getSubject()).isEqualTo("Simulated MQ Subject");

        // Verify database logging
        Awaitility.await()
                .atMost(Duration.ofSeconds(5))
                .untilAsserted(() -> {
                    List<EmailLog> logs = emailRepository.findAll();
                    assertThat(logs).anyMatch(l -> 
                        l.getRecipient().equals("flow-test@example.com") && 
                        l.getStatus().name().equals("SENT")
                    );
                });
    }
}
