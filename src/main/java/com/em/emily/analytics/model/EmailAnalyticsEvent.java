package com.em.emily.analytics.model;

import com.em.emily.analytics.EmailEventType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailAnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long emailId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailEventType eventType;

    private String recipient;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
