package com.em.emily.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
public class RateLimitingIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @BeforeEach
    public void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    public void testRateLimitingTriggers429() throws Exception {
        // We configured the limit to 60 requests per minute
        // Let's fire 60 requests which should be allowed
        for (int i = 0; i < 60; i++) {
            mockMvc.perform(get("/api/public")
                            .header("X-Forwarded-For", "192.168.1.101"))
                   .andExpect(result -> {
                       int status = result.getResponse().getStatus();
                       assert status != 429;
                   });
        }

        // The 61st request should hit the rate limit and return 429
        mockMvc.perform(get("/api/public")
                        .header("X-Forwarded-For", "192.168.1.101"))
               .andExpect(status().isTooManyRequests());
    }
}
