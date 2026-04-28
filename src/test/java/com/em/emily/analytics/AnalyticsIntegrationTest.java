package com.em.emily.analytics;

import com.em.emily.analytics.dto.AnalyticsStatsDto;
import com.em.emily.analytics.dto.EventRequest;
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

import static org.assertj.core.api.Assertions.assertThat;
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
public class AnalyticsIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void testAnalyticsTrackingAndStats() throws Exception {
        Long emailId = 123L;

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
        MvcResult result = mockMvc.perform(get("/api/v1/analytics/stats"))
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
}
