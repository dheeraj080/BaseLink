# EmILY — Email Pipeline & Provider Architecture Review

---

## Architecture Overview

The codebase has **two completely separate and parallel email-sending systems** that are not integrated with each other. This is the single most critical architectural problem.

```
┌─────────────────────────────────────────────────────────┐
│                      SYSTEM A                           │
│          JavaMailSender (Spring-managed SMTP)           │
│  Used by: EmailService.sendEmail() / sendEmailWith...() │
│  Tracking: ✅  Logging: ✅  Analytics: ✅               │
│  Providers: Only SMTP (hardcoded Gmail in app.props)    │
└──────────────────────────────┬──────────────────────────┘
                               │ used by
              EmailController  │  EmailJob (Quartz)
                               │  EmailEventListener (Rabbit)
                               
┌─────────────────────────────────────────────────────────┐
│                      SYSTEM B                           │
│     MailSenderStrategy (custom HTTP provider layer)     │
│  Used by: EmailConfigController /test endpoint ONLY     │
│  Tracking: ❌  Logging: ❌  Analytics: ❌               │
│  Providers: SMTP, Resend, SendGrid, Brevo, Mailgun,     │
│             Postmark                                     │
└─────────────────────────────────────────────────────────┘
```

**System A** does all real sending — with full analytics tracking, email logs, async processing, and Quartz scheduling.  
**System B** (the `MailSenderStrategy` hierarchy with 6 providers) is only ever used by the `/email/config/test` endpoint. **No actual emails to users are ever sent through it.**

---

## Critical Issue #1 — The Provider Selection System Is Dead Code

**Files**: [`EmailConfigController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/controller/EmailConfigController.java), [`MailSenderFactory.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/service/MailSenderFactory.java), all 6 impl files in `impl/`

### What Was Intended
A user configures their preferred email provider (Resend, SendGrid, Mailgun, etc.) via the settings UI. When sending an email, the system looks up their `EmailConfig`, selects the right `MailSenderStrategy`, and sends through that provider.

### What Actually Happens
1. User saves config → stored in `email_configs` table ✅
2. User sends email via `POST /email/send` → **goes directly to `EmailService`** which calls `JavaMailSender` (the app-level Gmail SMTP from `application.properties`) — **the saved config is never read**.
3. The `MailSenderFactory` and all 6 provider implementations are only touched by `POST /email/config/test`.

### Evidence
```java
// EmailController.java — POST /email/send
emailService.sendEmail(
    request.to(), request.cc(), request.bcc(), request.replyTo(),
    request.subject(), request.body(),
    principal.id(), request.isMarketing()
);
// ↑ EmailService uses injected JavaMailSender — NOT EmailConfig from DB
```

There is no call to `emailConfigRepository.findByUserId()` anywhere in the email-sending path.

### Impact
🔴 **Catastrophic**. The entire feature promised to users (bring-your-own Resend/SendGrid key) silently does nothing. Every email goes through the system owner's Gmail SMTP account regardless of the user's configuration. Users sending 10,000 emails will hit Gmail's sending limits and receive no error.

### Fix
The `EmailService.sendEmail()` method must:
1. Look up `EmailConfig` by `userId`.
2. If a config exists and `isActive`, dispatch through `MailSenderStrategy` via `MailSenderFactory`.
3. Fall back to the default `JavaMailSender` only if no config is found.

```java
// Proposed fix in EmailService
Optional<EmailConfig> configOpt = emailConfigRepository.findByUserId(userId);
if (configOpt.isPresent() && configOpt.get().isActive()) {
    MailSenderStrategy strategy = mailSenderFactory.getSender(configOpt.get().getProviderType());
    strategy.send(configOpt.get(), to, cc, bcc, subject, body, null);
    // Then persist log + publish event
} else {
    // existing JavaMailSender path
}
```

---

## Critical Issue #2 — Provider Strategies Bypass All Analytics and Logging

**Files**: All files in [`impl/`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/service/impl/)

Every `MailSenderStrategy.send()` implementation fires an HTTP request to the external API and either succeeds or throws a `RuntimeException`. There is:
- **No `EmailLog` created** — the send is invisible to the logs page
- **No `EmailSentEvent` published** — analytics never records SENT or DELIVERED events
- **No retry tracking** — a `RuntimeException` causes the Quartz job to fail silently
- **No tracking pixel / unsubscribe link injection** — the `instrumentEmailBody()` method in `EmailService` is never called

This means if System B were ever wired in, users would see zero analytics data for any emails sent via Resend, SendGrid, etc.

### Fix
Wrap every `MailSenderStrategy.send()` call inside a logging harness:
```java
EmailLog log = new EmailLog();
log.setRecipient(recipient);
log.setStatus(EmailStatus.PENDING);
// ...
emailRepository.save(log);
try {
    strategy.send(config, List.of(recipient), cc, bcc, 
                  instrumentEmailBody(body, log.getId(), recipient, isMarketing), filePaths);
    log.setStatus(EmailStatus.SENT);
    eventPublisher.publishEvent(new EmailSentEvent(...));
} catch (Exception e) {
    log.setStatus(EmailStatus.FAILED);
    log.setErrorMessage(e.getMessage());
} finally {
    emailRepository.save(log);
}
```

---

## Issue #3 — `MailSenderStrategy` Interface Signature Forces File Paths, Not Streams

**File**: [`MailSenderStrategy.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/service/MailSenderStrategy.java)

```java
void send(EmailConfig config, List<String> to, List<String> cc, List<String> bcc,
          String subject, String body, List<String> filePaths);
```

The interface accepts `List<String> filePaths` — local filesystem paths. This creates two problems:

1. **HTTP providers can't use paths**: Brevo, Resend, SendGrid, Mailgun, and Postmark all accept base64-encoded attachment content in their API payloads — not file paths. None of the 5 HTTP implementations handle `filePaths` at all (they silently ignore the parameter).

2. **Resend explicitly acknowledges this problem** in a code comment:
```java
// Note: For attachments, Resend supports attachments parameter as an array of objects:
// [{"content": "base64", "filename": "name.txt"}]
// We will leave a stub or skip/include placeholder for attachments.
```

3. **SMTP is the only implementation** that actually handles file paths via `JavaMailSenderImpl`. All other providers silently drop attachments.

### Impact
🔴 **Silent data loss**. A user schedules an email with an attachment, picks Resend as their provider — the attachment is never sent and no error is raised.

### Fix
Change the interface to accept `List<MultipartFile>` or a more flexible `Attachment` type:
```java
public record Attachment(String filename, byte[] content, String mimeType) {}

void send(EmailConfig config, List<String> to, List<String> cc, List<String> bcc,
          String subject, String body, List<Attachment> attachments);
```
Each provider impl then base64-encodes the bytes for HTTP providers and streams them for SMTP.

---

## Issue #4 — `SmtpMailSender` Creates a New `JavaMailSenderImpl` Per Send

**File**: [`SmtpMailSender.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/service/impl/SmtpMailSender.java#L25)

```java
public void send(...) {
    JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
    mailSender.setHost(config.getSmtpHost());
    mailSender.setPort(config.getSmtpPort());
    // ...
    mailSender.send(message);
}
```

A brand-new `JavaMailSenderImpl` is instantiated and configured on every single call. `JavaMailSenderImpl` creates a new SMTP connection from scratch each time — there is no connection pooling.

For a broadcast to 1,000 contacts, this opens and closes 1,000 separate SMTP TCP connections.

### Impact
🟠 Severe performance degradation and resource exhaustion for large broadcasts. SMTP servers often rate-limit or ban IPs that open many short-lived connections.

### Fix
Either cache the sender per `(host, port, username)` tuple, or use a `Session`-reusing transport explicitly:
```java
// Cache by config identity
private final Map<String, JavaMailSenderImpl> senderCache = new ConcurrentHashMap<>();

private JavaMailSenderImpl getSender(EmailConfig config) {
    String key = config.getSmtpHost() + ":" + config.getSmtpPort() + ":" + config.getSmtpUsername();
    return senderCache.computeIfAbsent(key, k -> buildSender(config));
}
```

---

## Issue #5 — `MailgunMailSender` Derives the Domain From the `fromEmail` Address

**File**: [`MailgunMailSender.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/service/impl/MailgunMailSender.java#L29)

```java
String fromEmail = config.getFromEmail();
String domain = fromEmail.substring(fromEmail.indexOf("@") + 1);
// Used in: "https://api.mailgun.net/v3/" + domain + "/messages"
```

Mailgun requires the **verified sending domain** in the API URL. This is usually the domain of the `fromEmail`, but:

1. If `fromEmail` is `hello@subdomain.company.com`, the Mailgun domain might be `company.com` (not `subdomain.company.com`). This will produce a 404.
2. Mailgun also supports EU region endpoints (`api.eu.mailgun.net`). There's no way to configure this.
3. `fromEmail.indexOf("@")` will throw a `StringIndexOutOfBoundsException` if `fromEmail` is null or missing `@`.

### Fix
Add a `smtpHost` field (or a `domain` field) to `EmailConfig` that Mailgun users can explicitly set, and use it as the API domain. The current `smtpHost` field is already there for SMTP — repurpose it or add a generic `apiDomain` field.

---

## Issue #6 — All HTTP Providers Create a New `RestClient` Instance Per Bean

**Files**: All 5 HTTP provider implementations

```java
@Service
public class BrevoMailSender implements MailSenderStrategy {
    private final RestClient restClient = RestClient.create();
```

`RestClient.create()` uses the default `ClientHttpRequestFactory`, which typically wraps `HttpURLConnection` — no connection pooling, no keep-alive reuse. All 5 providers create their own isolated `RestClient` instance.

### Impact
🟡 Performance overhead. Each HTTP call opens a new TCP connection and TLS handshake to the provider's API.

### Fix
Inject a shared `RestClient` (or `RestClient.Builder`) configured with a pooled HTTP client like Apache HttpComponents or OkHttp:
```java
// In a @Configuration class
@Bean
public RestClient sharedRestClient() {
    return RestClient.builder()
        .requestFactory(new HttpComponentsClientHttpRequestFactory())
        .build();
}
// Then inject it into each provider
```

---

## Issue #7 — AES-ECB Encryption Is Used for API Keys

**File**: [`AesEncryptorConverter.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/common/converter/AesEncryptorConverter.java#L35)

```java
Cipher cipher = Cipher.getInstance("AES"); // ← ECB mode (no IV)
cipher.init(Cipher.ENCRYPT_MODE, secretKey);
```

Calling `Cipher.getInstance("AES")` defaults to **AES/ECB/PKCS5Padding**. ECB (Electronic Codebook) mode has a well-known flaw: identical plaintext blocks produce identical ciphertext blocks. For short, structured strings like API keys (`re_XXXX...`, `SG.XXXX...`), this means:
- The encryption pattern can leak information about the key prefix.
- It is not semantically secure — same API key always encrypts to the same ciphertext.

### Fix
Use AES/GCM/NoPadding (authenticated encryption with a random IV per encryption):
```java
// Encrypt
byte[] iv = new byte[12];
new SecureRandom().nextBytes(iv);
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(128, iv));
byte[] encrypted = cipher.doFinal(plaintext.getBytes());
// Store: base64(iv + encrypted)
```
Note: Existing stored values would need to be re-encrypted after the migration.

---

## Issue #8 — `broadcastToSelected` in `ContactController` Has 7 `System.out.println` Debug Statements

**File**: [`ContactController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/contact/controller/ContactController.java#L108-L148)

```java
System.out.println("DEBUG: broadcastToSelected called!");
System.out.println("DEBUG: request payload -> " + request);
System.out.println("DEBUG: Recipients list extracted -> " + recipients);
// ...4 more System.out.println calls
```

These print the full `EmailRequest` (including `body`, recipient list, and `userId`) directly to stdout in production. This is:
- A **log injection risk** — a maliciously crafted email body could pollute logs.
- A **data privacy violation** — email addresses and content are written unredacted to stdout.
- A performance anti-pattern (stdout in a high-throughput request path).

### Fix
Replace every `System.out.println` with `log.debug(...)` using the `@Slf4j` annotation. Debug logs are disabled in production by default:
```java
@Slf4j
public class ContactController {
    // ...
    log.debug("broadcastToSelected called with {} recipients", recipients != null ? recipients.size() : 0);
}
```

---

## Issue #9 — `EmailRequest` Record Defaults `isMarketing` to `true` in All Compact Constructors

**File**: [`EmailRequest.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/EmailRequest.java#L41)

```java
// 6-arg constructor
public EmailRequest(List<String> to, List<String> cc, List<String> bcc,
                    String replyTo, String subject, String body) {
    this(to, cc, bcc, replyTo, subject, body, null, true, null);
    //                                                 ^^^^
    //                                          isMarketing = true always
}
```

The `EmailEventListener` (which handles RabbitMQ messages for auth/transactional emails) creates `EmailRequest` objects using this 6-arg constructor. As a result, **all transactional emails** (account activation, password reset) are flagged as `isMarketing = true`.

This means:
1. Transactional emails get **tracking pixels and unsubscribe links** injected into them via `instrumentEmailBody()`.
2. They count toward marketing analytics stats, polluting open rates.
3. An activation email asking a new user to "click to activate" would have its link rewritten to an analytics click-tracking redirect.

### Fix
Change the 6-arg compact constructor to default `isMarketing` to `false` for transactional sends:
```java
public EmailRequest(List<String> to, ..., String body) {
    this(to, cc, bcc, replyTo, subject, body, null, false, null);
}
```

---

## Issue #10 — `EmailService` Does Not Set `cc`/`bcc` in the Non-Attachment Path

**File**: [`EmailService.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/service/EmailService.java#L87-L97)

In `sendEmail()` (the standard path), the code:
1. Iterates over `allRecipients` (a combined set of `to + cc + bcc`)
2. Creates one `EmailLog` per recipient ✅ (correct)
3. Creates a `MimeMessage` and calls `helper.setTo(recipient)` for each

But it **never calls `helper.setCc()` or `helper.setBcc()`**. The cc/bcc recipients each receive their own copy of the email addressed only to themselves — the CC/BCC header information is completely lost.

Compare with `sendEmailWithAttachments()` at line 144-145, which correctly sets both:
```java
if (cc != null && !cc.isEmpty()) helper.setCc(cc.toArray(new String[0]));
if (bcc != null && !bcc.isEmpty()) helper.setBcc(bcc.toArray(new String[0]))
```

### Impact
🔴 Functional bug. Users setting a CC or BCC on a non-attachment send get unexpected behavior — each person gets a direct email with no CC header.

### Fix
Add the `cc`/`bcc` assignment inside the `sendEmail()` loop:
```java
// After helper.setTo(recipient):
if (cc != null && !cc.isEmpty()) helper.setCc(cc.toArray(new String[0]));
if (bcc != null && !bcc.isEmpty()) helper.setBcc(bcc.toArray(new String[0]));
```

---

## Issue #11 — Quartz Job Serializes Email Body Into `JobDataMap` (100KB Limit)

**File**: [`EmailController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/controller/EmailController.java#L130-L138)

```java
JobDetail jobDetail = JobBuilder.newJob(EmailJob.class)
    .usingJobData("body", request.body())  // ← full HTML body
    .usingJobData("subject", request.subject())
    // ...
    .build();
```

Quartz's `JobDataMap` stores values in the database as VARCHAR/TEXT. For large HTML bodies (email templates can be 50KB+), this:
- **May exceed database column size limits** depending on Quartz's schema column type.
- Stores large payloads in Quartz's scheduling tables, which are optimized for metadata, not content.
- Makes the `QRTZ_JOB_DETAILS` table very heavy for high-volume scheduling.

### Fix
Save the `EmailRequest` as an `EmailDraft` first, then only store the draft `id` in the `JobDataMap`:
```java
EmailDraft draft = draftService.saveDraft(request, userId);
JobDetail jobDetail = JobBuilder.newJob(EmailJob.class)
    .usingJobData("draftId", draft.getId())
    .usingJobData("userId", userId.toString())
    .build();
// In EmailJob.executeInternal: load draft by ID, then send
```

---

## Issue #12 — `@GetMapping /track/reply/{emailId}` Cannot Be Triggered By a Reply

**File**: [`AnalyticsController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/analytics/controller/AnalyticsController.java#L79-L83)

```java
@GetMapping("/track/reply/{emailId}")
public ResponseEntity<String> trackReply(@PathVariable Long emailId, @RequestParam String recipient) {
    analyticsService.recordEvent(emailId, EmailEventType.REPLIED, recipient);
    return ResponseEntity.ok("Reply registered successfully.");
}
```

This endpoint exists and works correctly — but **there is no mechanism to call it**. A reply event occurs when a recipient's email client sends a reply to the message. That happens outside the system. To capture reply events, you need:
- A **reply-to address** that routes through a server you control (e.g., `reply+{emailId}@yourdomain.com`)
- An **inbound email parsing webhook** from a provider like Mailgun or Sendgrid that POSTs to your server when a reply arrives

The current implementation requires the frontend to manually call this endpoint — which it never does. The `totalReplied` stat will always be 0.

### Impact
🟡 Feature gap — `replyRate` will always be 0% in analytics.

---

## Issue #13 — `EmailTemplateController` Has No Authorization on `GET/PUT/DELETE`

**File**: [`EmailTemplateController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/controller/EmailTemplateController.java#L32-L46)

```java
@GetMapping("/{id}")
public ResponseEntity<EmailTemplate> get(@PathVariable UUID id) {
    return ResponseEntity.ok(templateService.getTemplateById(id)); // No userId check!
}

@PutMapping("/{id}")
public ResponseEntity<EmailTemplate> update(@PathVariable UUID id, @RequestBody EmailTemplate details) {
    return ResponseEntity.ok(templateService.updateTemplate(id, details)); // No userId check!
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable UUID id) {
    templateService.deleteTemplate(id); // No userId check!
    return ResponseEntity.noContent().build();
}
```

Any authenticated user can read, modify, or delete any other user's email template if they know (or guess) the UUID.

### Impact
🔴 **Security vulnerability** — Insecure Direct Object Reference (IDOR). A user who discovers the UUID of another user's template can delete or modify it.

### Fix
```java
@GetMapping("/{id}")
public ResponseEntity<EmailTemplate> get(@PathVariable UUID id,
        @AuthenticationPrincipal(expression = "id") UUID userId) {
    EmailTemplate template = templateService.getTemplateById(id);
    if (!template.getUserId().equals(userId)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(template);
}
```

---

## Issue #14 — `ContactController.delete()` Has No Ownership Check

**File**: [`ContactController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/controller/EmailTemplateController.java)

```java
@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable UUID id) {
    contactService.deleteContact(id); // No principal check at all!
    return ResponseEntity.noContent().build();
}
```

Any authenticated user can delete any contact by UUID. No `userId` ownership verification is performed.

### Impact
🔴 **Security vulnerability** — same IDOR pattern as the template controller.

### Fix
Pass `principal.id()` to `contactService.deleteContact(id, principal.id())` and verify ownership in the service layer.

---

## Complete Email Sending Flow Diagram

```
┌────────────┐   POST /contacts/broadcast     ┌─────────────────────┐
│  Frontend  │──────────────────────────────► │  ContactController  │
└────────────┘                                └────────┬────────────┘
                                                       │ per-recipient EmailRequest
                                                       │ rabbitTemplate.convertAndSend()
                                                       ▼
                                              ┌─────────────────────┐
                                              │   RabbitMQ Queue    │
                                              │  email.queue        │
                                              └────────┬────────────┘
                                                       │ @RabbitListener
                                                       ▼
┌────────────┐   POST /email/send             ┌─────────────────────┐
│  Frontend  │──────────────────────────────► │  EmailController    │
└────────────┘                                └────────┬────────────┘
                                                       │
                                     ┌─────────────────┴─────────────────┐
                                     ▼                                     ▼
                          ┌──────────────────┐               ┌─────────────────────┐
                          │  EmailService    │               │  EmailEventListener │
                          │  sendEmail()     │◄──────────────│  handleEmailEvent() │
                          └────────┬─────────┘               └─────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼               ▼
             [Per-Recipient]  [EmailLog]    [JavaMailSender]
             Save PENDING     in DB         .send(message)
                                                   │
                                     ┌─────────────┴────────────┐
                                     │  instrumentEmailBody()   │
                                     │  - Tracking pixel        │
                                     │  - Unsubscribe link      │
                                     │  - Click rewrite         │
                                     └──────────────────────────┘
                                                   │
                                        ┌──────────┴──────────┐
                                        ▼                      ▼
                                  [EmailLog]           [EmailSentEvent]
                                  SENT/FAILED          via ApplicationEventPublisher
                                                               │
                                                               ▼
                                                    ┌──────────────────┐
                                                    │ AnalyticsService │
                                                    │ recordEvent()    │
                                                    │ SENT + DELIVERED │
                                                    └──────────────────┘
```

---

## Priority Fix List for Email Pipeline

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | Provider selection is dead — all emails use Gmail SMTP | 🔴 Critical | High |
| 2 | MailSenderStrategy bypasses logging + analytics | 🔴 Critical | High |
| 3 | IDOR on template GET/PUT/DELETE | 🔴 High | Low |
| 4 | IDOR on contact DELETE | 🔴 High | Low |
| 5 | `isMarketing` defaults to `true` for transactional emails | 🔴 High | Low |
| 6 | CC/BCC headers missing in `sendEmail()` non-attachment path | 🔴 High | Low |
| 7 | `System.out.println` of email content in broadcast path | 🔴 High | Low |
| 8 | AES-ECB mode for API key encryption | 🟠 Medium | Medium |
| 9 | `SmtpMailSender` creates new connection per send (no pooling) | 🟠 Medium | Medium |
| 10 | Attachment support silently dropped for HTTP providers | 🟠 Medium | High |
| 11 | Mailgun domain derived from email address (fragile) | 🟠 Medium | Low |
| 12 | Quartz `JobDataMap` stores full email body (size risk) | 🟠 Medium | Medium |
| 13 | All 5 HTTP providers create isolated `RestClient` (no pooling) | 🟡 Low | Low |
| 14 | `/track/reply` endpoint is unreachable without inbound mail parsing | 🟡 Low | High |
