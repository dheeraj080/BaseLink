package com.em.emily.analytics;

import com.em.emily.AbstractIntegrationTest;
import com.em.emily.analytics.dto.AnalyticsStatsDto;
import com.em.emily.analytics.dto.EventRequest;
import com.em.emily.auth.UserPrincipal;
import com.em.emily.email.model.EmailLog;
import com.em.emily.email.model.EmailStatus;
import com.em.emily.email.repository.EmailRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "security.jwt.secret=9a67473d4644440a76be0488f7832811293290626b382d6b380302d9600e12345",
        "security.jwt.access-ttl-seconds=3600",
        "security.jwt.refresh-ttl-seconds=2592000",
        "security.jwt.issuer=emily-auth-test",
        "spring.security.oauth2.client.registration.google.client-id=mock-id",
        "spring.security.oauth2.client.registration.google.client-secret=mock-secret"
})
@ActiveProfiles("test")
public class AnalyticsIntegrationTest extends AbstractIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmailRepository emailRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
        emailRepository.deleteAll();
    }

    @Test
    void testAnalyticsTrackingAndStats() throws Exception {
        UUID testUserId = UUID.randomUUID();
        
        EmailLog emailLog = EmailLog.builder()
                .recipient("test@example.com")
                .subject("Integration Test Subject")
                .status(EmailStatus.SENT)
                .userId(testUserId)
                .build();
        emailLog = emailRepository.save(emailLog);
        Long emailId = emailLog.getId();

        // 1. Send / Simulate SENT event
        EventRequest sentEvent = EventRequest.builder()
                .emailId(emailId)
                .eventType(EmailEventType.SENT)
                .recipient("test@example.com")
                .build();

        mockMvc.perform(post("/api/v1/analytics/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sentEvent)))
                .andExpect(status().isCreated());

        // 2. Simulate DELIVERED event
        EventRequest deliveredEvent = EventRequest.builder()
                .emailId(emailId)
                .eventType(EmailEventType.DELIVERED)
                .recipient("test@example.com")
                .build();

        mockMvc.perform(post("/api/v1/analytics/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deliveredEvent)))
                .andExpect(status().isCreated());

        // 3. Track OPEN
        mockMvc.perform(get("/api/v1/analytics/track/open/" + emailId))
                .andExpect(status().isOk());

        // Track OPEN again (should not increment distinct count)
        mockMvc.perform(get("/api/v1/analytics/track/open/" + emailId))
                .andExpect(status().isOk());

        // 4. Track CLICK
        mockMvc.perform(get("/api/v1/analytics/track/click/" + emailId)
                        .param("url", "http://example.com"))
                .andExpect(status().isFound());

        // 5. Verify Stats
        UserPrincipal principal = new UserPrincipal(testUserId, "test@example.com");
        MvcResult result = mockMvc.perform(get("/api/v1/analytics/stats")
                        .with(user(principal)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        AnalyticsStatsDto stats = objectMapper.readValue(responseBody, AnalyticsStatsDto.class);

        assertThat(stats.getTotalSent()).isEqualTo(1);
        assertThat(stats.getTotalDelivered()).isEqualTo(1);
        assertThat(stats.getTotalOpened()).isEqualTo(1);
        assertThat(stats.getTotalClicked()).isEqualTo(1);
        
        assertThat(stats.getOpenRate()).isEqualTo(100.0);
        assertThat(stats.getClickThroughRate()).isEqualTo(100.0);
        assertThat(stats.getClickToOpenRate()).isEqualTo(100.0);
    }

    @Test
    void testGetStatsForContact() throws Exception {
        Long emailId = 456L;
        String email = "contact@example.com";

        EventRequest sentEvent = EventRequest.builder()
                .emailId(emailId)
                .eventType(EmailEventType.SENT)
                .recipient(email)
                .build();

        mockMvc.perform(post("/api/v1/analytics/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sentEvent)))
                .andExpect(status().isCreated());

        MvcResult result = mockMvc.perform(get("/api/v1/analytics/contact")
                        .param("email", email))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        AnalyticsStatsDto stats = objectMapper.readValue(responseBody, AnalyticsStatsDto.class);

        assertThat(stats.getTotalSent()).isEqualTo(1);
    }
}

