package com.em.emily.email.controller;

import com.em.emily.email.model.EmailTemplate;
import com.em.emily.email.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/email/templates")
@RequiredArgsConstructor
public class EmailTemplateController {

    private final EmailTemplateService templateService;

    @PostMapping
    public ResponseEntity<EmailTemplate> create(@RequestBody EmailTemplate template,
                                               @AuthenticationPrincipal(expression = "id") UUID userId) {
        template.setUserId(userId);
        return ResponseEntity.ok(templateService.saveTemplate(template));
    }

    @GetMapping
    public ResponseEntity<List<EmailTemplate>> list(@AuthenticationPrincipal(expression = "id") UUID userId) {
        return ResponseEntity.ok(templateService.getUserTemplates(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplate> get(@PathVariable UUID id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplate> update(@PathVariable UUID id, @RequestBody EmailTemplate details) {
        return ResponseEntity.ok(templateService.updateTemplate(id, details));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
