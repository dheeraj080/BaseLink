package com.em.emily.auth.service;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.stereotype.Service;

import static dev.samstevens.totp.util.Utils.getDataUriForImage;

@Service
public class TotpService {

    private final int DEFAULT_TIME_STEP = 30; // RFC 6238 Standard

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1, 6);

    public String getQrCodeUri(String label, String secret) {
        QrData data = new QrData.Builder()
                .label(label)
                .secret(secret)
                .issuer("BaseLink")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        return data.getUri();
    }

    public String generateSecret() {
        return secretGenerator.generate();
    }

    public String generateCode(String secret) {
        return generateCode(secret, 600); // Default to 10 mins for legacy email/activation flows
    }

    public String generateCode(String secret, int timeStep) {
        long currentBucket = timeProvider.getTime() / timeStep;
        try {
            return codeGenerator.generate(secret, currentBucket);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate TOTP code", e);
        }
    }

    public boolean verifyCode(String secret, String code) {
        return verifyCode(secret, code, DEFAULT_TIME_STEP);
    }

    public boolean verifyCode(String secret, String code, int timeStep) {
        if (secret == null || secret.isEmpty()) {
            throw new RuntimeException("Secret cannot be null or empty");
        }
        CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
        ((DefaultCodeVerifier) verifier).setTimePeriod(timeStep);
        // We allow 1 period of discrepancy to be user-friendly
        ((DefaultCodeVerifier) verifier).setAllowedTimePeriodDiscrepancy(1);
        
        return verifier.isValidCode(secret, code);
    }
}
