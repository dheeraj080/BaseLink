package com.em.emily.email.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "email_drafts")
public class EmailDraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "draft_recipients", joinColumns = @JoinColumn(name = "draft_id"))
    @Column(name = "recipient")
    private List<String> to;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "draft_cc", joinColumns = @JoinColumn(name = "draft_id"))
    @Column(name = "cc_recipient")
    private List<String> cc;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "draft_bcc", joinColumns = @JoinColumn(name = "draft_id"))
    @Column(name = "bcc_recipient")
    private List<String> bcc;

    private String replyTo;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Builder.Default
    private boolean isMarketing = true;

    private String cronExpression;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
