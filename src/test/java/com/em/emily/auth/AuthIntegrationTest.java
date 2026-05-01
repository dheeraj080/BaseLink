package com.em.emily.auth;

import com.em.emily.auth.dto.LoginRequest;
import com.em.emily.auth.entity.Role;
import com.em.emily.auth.entity.User;
import com.em.emily.auth.repository.RefreshTokenRepository;
import com.em.emily.auth.repository.RoleRepository;
import com.em.emily.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Set;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "security.jwt.secret=vS9p8u2M5rX7n4Q1z6W0E3t9Y4A8S5D2F1G7H3J6K9L0P3M1N4B7V2C5X8Z1Q9W0",
        "security.jwt.access-ttl-seconds=3600",
        "security.jwt.refresh-ttl-seconds=2592000",
        "security.jwt.issuer=EmILY",
        "security.jwt.refresh-token-cookie-name=refresh_token",
        "security.jwt.cookie-http-only=true",
        "security.jwt.cookie-secure=false",
        "security.jwt.cookie-domain=",
        "security.jwt.cookie-same-site=Lax",
        "spring.security.oauth2.client.registration.google.client-id=mock-id",
        "spring.security.oauth2.client.registration.google.client-secret=mock-secret",
        "spring.mail.properties.mail.smtp.from=no-reply@emily.com"
})
@ActiveProfiles("test")
public class AuthIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private com.em.emily.auth.service.TotpService totpService;

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private com.em.emily.auth.service.EmailService emailService;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
        roleRepository.deleteAll();

        Role userRole = Role.builder().name("ROLE_USER").build();
        roleRepository.save(userRole);

        User user = User.builder()
                .email("test@example.com")
                .password(passwordEncoder.encode("password123"))
                .name("Test User")
                .enabled(true)
                .roles(Set.of(userRole))
                .build();
        userRepository.save(user);
    }

    @Test
    void testLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.user.email").value("test@example.com"));
    }

    @Test
    void testLoginFailure() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "wrongpassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRegisterAndActivate() throws Exception {
        com.em.emily.auth.dto.UserDTO registerDTO = com.em.emily.auth.dto.UserDTO.builder()
                .email("new@example.com")
                .password("password123")
                .name("New User")
                .build();

        // 1. Register
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerDTO)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail("new@example.com").orElseThrow();
        org.junit.jupiter.api.Assertions.assertFalse(user.isEnabled());
        org.junit.jupiter.api.Assertions.assertNotNull(user.getTotpSecret());

        // 2. Generate TOTP code
        String code = totpService.generateCode(user.getTotpSecret());

        // 3. Activate
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/auth/activate")
                        .param("email", "new@example.com")
                        .param("code", code))
                .andExpect(status().isFound());

        user = userRepository.findByEmail("new@example.com").orElseThrow();
        org.junit.jupiter.api.Assertions.assertTrue(user.isEnabled());
    }

    @Test
    void testForgotPasswordAndReset() throws Exception {
        // 1. Request Reset
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("email", "test@example.com"))))
                .andExpect(status().isOk());

        User user = userRepository.findByEmail("test@example.com").orElseThrow();
        org.junit.jupiter.api.Assertions.assertNotNull(user.getTotpSecret());

        // 2. Generate TOTP code
        String code = totpService.generateCode(user.getTotpSecret());

        // 3. Reset Password
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "email", "test@example.com",
                                "code", code,
                                "newPassword", "newpassword123"
                        ))))
                .andExpect(status().isOk());

        // 4. Login with new password
        LoginRequest loginRequest = new LoginRequest("test@example.com", "newpassword123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }
}
