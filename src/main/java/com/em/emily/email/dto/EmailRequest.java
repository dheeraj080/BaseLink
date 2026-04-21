package com.em.emily.email.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record EmailRequest(
        @NotEmpty(message = "Recipient list cannot be empty")
        List<@Email(message = "Invalid email format") String> to,

        @NotBlank(message = "Subject cannot be empty")
        String subject,

        @NotBlank(message = "Body cannot be empty")
        String body
) {}