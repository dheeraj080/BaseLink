package com.em.emily.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@Profile("dev") // Only active when spring.profiles.active=dev
public class DevSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                // NEW: Add a filter to inject a mock user so @AuthenticationPrincipal works
                .addFilterBefore((request, response, chain) -> {
                    com.em.emily.auth.UserPrincipal mockPrincipal = new com.em.emily.auth.UserPrincipal(
                            java.util.UUID.fromString("00000000-0000-0000-0000-000000000000"),
                            "dev-user@example.com"
                    );
                    org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth =
                            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                    mockPrincipal, null, java.util.Collections.emptyList()
                            );
                    org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);
                    chain.doFilter(request, response);
                }, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers.frameOptions(f -> f.disable()));

        return http.build();
    }
}
