package com.em.emily.email.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record EmailRequest(
        @NotEmpty(message = "Recipient list cannot be empty")
        List<@Email(message = "Invalid email format") String> to,

        List<@Email(message = "Invalid CC format") String> cc,

        List<@Email(message = "Invalid BCC format") String> bcc,

        @Email(message = "Invalid Reply-To format")
        String replyTo,

        @NotBlank(message = "Subject cannot be empty")
        String subject,

        @NotBlank(message = "Body cannot be empty")
        String body
) {}