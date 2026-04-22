package com.em.emily.contact.dto;


import com.em.emily.contact.entity.Selected;
import java.util.UUID;

public record ContactResponse(UUID id, String name, String email, Selected sendTo) {}