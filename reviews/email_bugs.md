# EmILY — Email Sending Bug Report

## Summary

5 distinct bugs found across the email pipeline, ranging from a critical silent failure to configuration gaps.

---

## 🔴 Bug #1 — `EmailService.sendEmail()` Never Sets a `From` Address (Critical)

**File**: [`EmailService.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/service/EmailService.java#L87-L97)

**Root cause**: The main `sendEmail` method builds a `MimeMessage` and sets `To`, `Subject`, and `Body` — but **never calls `helper.setFrom(...)`**. `JavaMailSender` sends the message with no `From` header, which causes:
- Gmail SMTP rejects the message outright (530/501 error)
- Other SMTP servers may silently drop it or bounce it

The `sendEmailWithAttachmentSupplier` private method has the same omission.

**Fix**: Add `helper.setFrom(mailUsername)` where `mailUsername` is injected from `${spring.mail.username}`.

**Status**: ✅ Fixed (see below)

---

## 🔴 Bug #2 — Auth Emails Go Through RabbitMQ → `EmailEventListener` → Back to `EmailService`, But the Queue May Not Be Configured on Startup (Critical for registration/password reset flows)

**Files**: 
- [`EmailServiceImpl.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/auth/service/impl/EmailServiceImpl.java) — publishes to `email.transactional.queue` via RabbitTemplate
- [`EmailEventListener.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/consumer/EmailEventListener.java) — listens on both queues and calls `emailService.sendEmail()`

**Root cause**: Auth emails (registration OTP, password reset) take this path:
```
UserServiceImpl/ResetPasswordService
  → EmailServiceImpl.sendEmail()
    → rabbitTemplate.convertAndSend(EXCHANGE, TRANSACTIONAL_ROUTING_KEY, request)
      → [RabbitMQ transactional.queue]
        → EmailEventListener.handleEmailEvent()
          → EmailService.sendEmail()  ← actual SMTP send (but hits Bug #1 above)
```

This means:
1. If RabbitMQ is unavailable at startup, auth emails silently fail (exception is caught and rethrown as RuntimeException, which breaks registration).
2. The `EmailRequest` is serialized to JSON via `JacksonJsonMessageConverter` — but `EmailRequest` is a Java Record with custom constructors. The default canonical constructor has `userId` and `cronExpression` fields that are `null` from the 3-argument compact constructor. **Jackson must be able to deserialize this record**, which requires either `@JsonCreator` or Jackson's record support (Jackson 2.12+). If the deserialization fails, the queue message is dead-lettered silently.

**Status**: ⚠️ Architectural risk noted — no code fix applied (depends on Jackson version and RabbitMQ availability). The immediate impact is masked by Bug #1.

---

## 🟠 Bug #3 — `sendEmail` Iterates `allRecipients` (a Set) But Only Sets `To` the Current Recipient, Losing CC/BCC Per-Recipient Logic

**File**: [`EmailService.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/service/EmailService.java#L71-L112)

**Root cause**: The main `sendEmail` method merges `to + cc + bcc` into a single `allRecipients` set and then iterates it, sending one email per address. This means:
- A CC recipient receives a direct email as `To:`, not as `CC:`
- The original `to` list's email also gets CC'd addresses sent directly as individual emails instead
- The correct behavior would be to send **one email** with all recipients in their proper fields

The `sendEmailWithAttachmentSupplier` does this correctly (sets `To`, `CC`, `BCC` on a single message). The main `sendEmail` method is broken by design.

**Fix**: Replace the flat iteration + HashSet expansion with the same single-message pattern used in `sendEmailWithAttachmentSupplier`.

**Status**: ✅ Fixed (see below)

---

## 🟡 Bug #4 — TRACE Security Logging Was Not Removed (Regression)

**File**: [`application.properties`](file:///d:/Projekt/EmILY/src/main/resources/application.properties#L92-L95)

Lines 92–95 still contain:
```properties
logging.level.com.em.emily.auth.security=DEBUG
logging.level.org.springframework.security.oauth2=TRACE
logging.level.org.springframework.web.client.RestTemplate=TRACE
logging.level.org.springframework.security=TRACE
```

These were supposed to be removed in code quality item #20. The file on disk still has them.

**Status**: ✅ Fixed (see below)

---

## 🟡 Bug #5 — `spring.mail.properties.mail.smtp.starttls.required` Is Missing

**File**: [`application.properties`](file:///d:/Projekt/EmILY/src/main/resources/application.properties#L42-L46)

`starttls.enable=true` allows STARTTLS but doesn't require it. Without `starttls.required=true`, JavaMail can fall back to an unencrypted connection if the server doesn't advertise STARTTLS, which is a security risk and can cause auth failures on strict SMTP servers (like Gmail).

**Status**: ✅ Fixed (see below)
