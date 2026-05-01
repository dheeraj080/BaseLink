package com.em.emily.common.converter;

import com.em.emily.common.util.EncryptionUtil;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
@Converter
public class TotpSecretConverter implements AttributeConverter<String, String> {

    private final EncryptionUtil encryptionUtil;

    // Use @Lazy to avoid circular dependency if EncryptionUtil needs other beans
    public TotpSecretConverter(@Lazy EncryptionUtil encryptionUtil) {
        this.encryptionUtil = encryptionUtil;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return encryptionUtil.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return encryptionUtil.decrypt(dbData);
    }
}
