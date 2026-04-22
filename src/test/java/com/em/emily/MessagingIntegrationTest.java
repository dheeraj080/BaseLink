package com.em.emily;

import com.em.emily.email.config.RabbitConfig;
import com.em.emily.email.dto.EmailRequest;
import com.em.emily.email.model.EmailLog;
import com.em.emily.email.repository.EmailRepository;
import com.icegreen.greenmail.configuration.GreenMailConfiguration;
import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.ServerSetupTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.awaitility.Awaitility;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers
@ActiveProfiles("test")
public class MessagingIntegrationTest {

    @Container
    static RabbitMQContainer rabbitMQContainer = new RabbitMQContainer("rabbitmq:3-management");

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private EmailRepository emailRepository;

    @RegisterExtension
    static GreenMailExtension greenMail = new GreenMailExtension(ServerSetupTest.SMTP)
            .withConfiguration(GreenMailConfiguration.aConfig().withUser("test", "test"))
            .withPerMethodLifecycle(false);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.rabbitmq.host", rabbitMQContainer::getHost);
        registry.add("spring.rabbitmq.port", rabbitMQContainer::getAmqpPort);
        
        registry.add("spring.mail.host", () -> "localhost");
        registry.add("spring.mail.port", () -> greenMail.getSmtp().getPort());
        registry.add("spring.mail.username", () -> "test");
        registry.add("spring.mail.password", () -> "test");
    }

    @Test
    void testEmailMessageConsumption() throws Exception {
        // Arrange
        EmailRequest request = new EmailRequest(
                List.of("mq-test@example.com"),
                null,
                null,
                null,
                "MQ Test Subject",
                "Testing message queue integration."
        );

        // Act: Send message to the exchange
        rabbitTemplate.convertAndSend(RabbitConfig.EXCHANGE, RabbitConfig.ROUTING_KEY, request);

        // Assert: Verify that the listener processed the message and sent the email
        
        // 1. Check GreenMail for the sent email
        assertThat(greenMail.waitForIncomingEmail(10000, 1)).isTrue();
        assertThat(greenMail.getReceivedMessages()[0].getSubject()).isEqualTo("MQ Test Subject");

        // 2. Check Database for the log entry updated by the service
        Awaitility.await()
                .atMost(Duration.ofSeconds(10))
                .untilAsserted(() -> {
                    List<EmailLog> logs = emailRepository.findAll();
                    assertThat(logs).anyMatch(log -> 
                        log.getRecipient().equals("mq-test@example.com") && 
                        log.getStatus().name().equals("SENT")
                    );
                });
    }
}
