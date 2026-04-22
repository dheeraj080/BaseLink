package com.em.emily.contact.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @ToString.Include
    private UUID id;

    @ToString.Include
    @Column(length = 255)
    private String name;

    @Email
    @ToString.Include
    @NotNull(message = "Email address is required")
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 15)
    private String phoneNo;

    @Column(length = 1000)
    private String description;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'NO'") // ADD THIS
    private Selected sendTo = Selected.NO;


    // create and update at

    @Builder.Default
    @Column(updatable = false, nullable = false)
    private Instant createdAt = Instant.now();

    @Builder.Default
    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PrePersist
    public void onPrePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}