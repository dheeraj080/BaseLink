package com.em.emily.email.model;

import com.em.emily.common.converter.AesEncryptorConverter;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "email_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false)
    private EmailProviderType providerType;

    @Column(name = "from_email", nullable = false)
    private String fromEmail;

    @Column(name = "smtp_host")
    private String smtpHost;

    @Column(name = "smtp_port")
    private Integer smtpPort;

    @Column(name = "smtp_username")
    private String smtpUsername;

    @Column(name = "encrypted_api_key", length = 1024)
    @Convert(converter = AesEncryptorConverter.class)
    private String encryptedApiKey;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;
}
