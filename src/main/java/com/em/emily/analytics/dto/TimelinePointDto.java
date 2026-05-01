package com.em.emily.analytics.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelinePointDto {
    private LocalDate date;
    private long sent;
    private long opens;
    private long clicks;
    private long unsubscribed;
}
