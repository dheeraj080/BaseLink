package com.em.emily.analytics.dto;

import com.em.emily.analytics.EmailEventType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {
    private Long emailId;
    private EmailEventType eventType;
    private String recipient;
}
