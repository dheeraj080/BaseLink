package com.em.emily.email.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter
@Setter
public class EmailRequest {

    @Email
    @NotEmpty
    @Size(min = 1, max = 255)
    private String email;

    @NotEmpty
    @Size(min = 1, max = 255)
    private String subject;

    @NotEmpty
    @Size(min = 1, max = 1000)
    private String body;

    @NotNull
    private LocalDateTime dateTime;

    @NotNull
    private ZoneId timeZone;

}
