package com.em.emily.contact.dto;
import java.util.List;
import java.util.UUID;

public record BulkSelectionRequest(List<UUID> contactIds, boolean selected) {}