package com.em.emily.email;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.io.Serializable;
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
        String body,

        java.util.UUID userId,

        Boolean isMarketing,

        String cronExpression
) implements Serializable {

    @JsonCreator
    public EmailRequest(
            @JsonProperty("to") java.util.List<String> to,
            @JsonProperty("cc") java.util.List<String> cc,
            @JsonProperty("bcc") java.util.List<String> bcc,
            @JsonProperty("replyTo") String replyTo,
            @JsonProperty("subject") String subject,
            @JsonProperty("body") String body,
            @JsonProperty("userId") java.util.UUID userId,
            @JsonProperty("isMarketing") Boolean isMarketing,
            @JsonProperty("cronExpression") String cronExpression
    ) {
        this.to = to;
        this.cc = cc;
        this.bcc = bcc;
        this.replyTo = replyTo;
        this.subject = subject;
        this.body = body;
        this.userId = userId;
        this.isMarketing = isMarketing;
        this.cronExpression = cronExpression;
    }

    public EmailRequest(
            java.util.List<String> to,
            java.util.List<String> cc,
            java.util.List<String> bcc,
            String replyTo,
            String subject,
            String body
    ) {
        this(to, cc, bcc, replyTo, subject, body, null, true, null);
    }
    
    public EmailRequest(
            java.util.List<String> to,
            java.util.List<String> cc,
            java.util.List<String> bcc,
            String replyTo,
            String subject,
            String body,
            java.util.UUID userId
    ) {
        this(to, cc, bcc, replyTo, subject, body, userId, true, null);
    }
    
    public Boolean isMarketing() {
        return isMarketing == null ? true : isMarketing;
    }

    private static final long serialVersionUID = 1L;
}