package com.em.emily.contact.dto;

import java.io.Serializable;
import java.util.List;

public record EmailMessage(
        List<String> to,
        List<String> cc,   // Added
        List<String> bcc,  // Added
        String subject,
        String body
) {}