package com.em.emily.contact.dto;

import java.util.UUID;

public record ContactResponse(UUID id, String name, String email, boolean selected) {}