package com.em.emily.email.service;

import com.em.emily.email.model.EmailTemplate;
import com.em.emily.email.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    private final EmailTemplateRepository templateRepository;

    public EmailTemplate saveTemplate(EmailTemplate template) {
        return templateRepository.save(template);
    }

    public List<EmailTemplate> getUserTemplates(UUID userId) {
        return templateRepository.findByUserId(userId);
    }

    public EmailTemplate getTemplateById(UUID id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    public EmailTemplate updateTemplate(UUID id, EmailTemplate details) {
        EmailTemplate existing = getTemplateById(id);
        existing.setName(details.getName());
        existing.setSubject(details.getSubject());
        existing.setContent(details.getContent());
        return templateRepository.save(existing);
    }

    public void deleteTemplate(UUID id) {
        templateRepository.deleteById(id);
    }
}
