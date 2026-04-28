package com.em.emily.contact.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "contact_groups")
public class ContactGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @ToString.Include
    private UUID id;

    @ToString.Include
    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToMany(mappedBy = "groups")
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("groups")
    private Set<Contact> contacts = new HashSet<>();

    @Builder.Default
    @Column(updatable = false, nullable = false)
    private Instant createdAt = Instant.now();

    @PrePersist
    public void onPrePersist() {
        this.createdAt = Instant.now();
    }
}
