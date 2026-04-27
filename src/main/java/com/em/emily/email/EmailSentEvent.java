package com.em.emily.email;

import java.time.LocalDateTime;

public record EmailSentEvent(
    Long emailId,
    String recipient,
    String subject,
    LocalDateTime sentAt
) {}
