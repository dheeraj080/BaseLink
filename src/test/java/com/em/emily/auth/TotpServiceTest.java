package com.em.emily.auth;

import com.em.emily.auth.service.TotpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class TotpServiceTest {

    private TotpService totpService;

    @BeforeEach
    void setUp() {
        totpService = new TotpService();
    }

    @Test
    void testGenerateSecret() {
        String secret = totpService.generateSecret();
        assertNotNull(secret);
        assertFalse(secret.isEmpty());
        // Base32 secrets usually have a specific format, but we just check it's not null
    }

    @Test
    void testGenerateAndVerifyCode() {
        String secret = totpService.generateSecret();
        String code = totpService.generateCode(secret);
        
        assertNotNull(code);
        assertEquals(6, code.length());
        
        boolean isValid = totpService.verifyCode(secret, code);
        assertTrue(isValid, "Code should be valid immediately after generation");
    }

    @Test
    void testVerifyInvalidCode() {
        String secret = totpService.generateSecret();
        boolean isValid = totpService.verifyCode(secret, "000000");
        assertFalse(isValid, "Random code should not be valid");
    }

    @Test
    void testVerifyEmptySecret() {
        assertThrows(RuntimeException.class, () -> {
            totpService.verifyCode(null, "123456");
        });
    }
}
