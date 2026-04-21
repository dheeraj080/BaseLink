package com.em.emily.email.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class EmailControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testSendAttachmentSuccessfully() throws Exception {
        // 1. Create a dummy file in memory
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "Hello, this is a test file".getBytes()
        );

        // 2. Perform the request exactly as the controller expects
        mockMvc.perform(multipart("/api/v1/email/send-attachment")
                        .file(file)
                        .param("to", "test@test.com")
                        .param("subject", "Automated Test")
                        .param("body", "This is an automated test body"))
                .andExpect(status().isAccepted()); // Verify we get 202
    }
}