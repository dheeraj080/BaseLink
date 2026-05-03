package com.em.emily.email.service;

import com.em.emily.email.EmailRequest;
import com.em.emily.email.model.EmailDraft;
import com.em.emily.email.repository.EmailDraftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailDraftService {

    private final EmailDraftRepository draftRepository;

    @Transactional
    public EmailDraft saveDraft(EmailRequest request, UUID userId) {
        EmailDraft draft = EmailDraft.builder()
                .userId(userId)
                .to(request.to())
                .cc(request.cc())
                .bcc(request.bcc())
                .replyTo(request.replyTo())
                .subject(request.subject())
                .body(request.body())
                .isMarketing(request.isMarketing())
                .cronExpression(request.cronExpression())
                .build();
        return draftRepository.save(draft);
    }

    @Transactional
    public EmailDraft updateDraft(Long draftId, EmailRequest request, UUID userId) {
        EmailDraft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));
        
        if (!draft.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this draft");
        }

        draft.setTo(request.to());
        draft.setCc(request.cc());
        draft.setBcc(request.bcc());
        draft.setReplyTo(request.replyTo());
        draft.setSubject(request.subject());
        draft.setBody(request.body());
        draft.setMarketing(request.isMarketing());
        draft.setCronExpression(request.cronExpression());

        return draftRepository.save(draft);
    }

    @Transactional(readOnly = true)
    public List<EmailDraft> getDraftsByUser(UUID userId) {
        return draftRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public EmailDraft getDraft(Long draftId, UUID userId) {
        EmailDraft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));
        
        if (!draft.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to access this draft");
        }
        return draft;
    }

    @Transactional
    public void deleteDraft(Long draftId, UUID userId) {
        EmailDraft draft = getDraft(draftId, userId);
        draftRepository.delete(draft);
    }
}
