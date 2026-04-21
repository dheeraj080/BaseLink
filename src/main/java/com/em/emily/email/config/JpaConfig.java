package com.em.emily.email.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaConfig {
    // This empty class enables the @CreatedDate and @LastModifiedDate annotations
}