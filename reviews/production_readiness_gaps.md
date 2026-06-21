# EmILY — Production Readiness Gap Analysis

> Based on review of the full backend, frontend, deployment config, security layer, tests, and infrastructure.

---

## What Has Already Been Reviewed

| Area | Status |
|---|---|
| Frontend dead code / duplicate logic | ✅ Reviewed |
| Email provider abstraction (MailSenderStrategy) | ✅ Reviewed |
| Email sending pipeline (EmailService) | ✅ Reviewed |
| Analytics & tracking | ✅ Reviewed |
| Rate limiting | ✅ Reviewed |
| Auth (JWT, OAuth2, TOTP) | ✅ Reviewed |
| Contact service & CRUD | ✅ Reviewed |
| Global exception handler | ✅ Reviewed |
| Docker / Render deployment | ✅ Reviewed |
| Test coverage | ✅ Reviewed |

---

## What Still Needs Review (and Why It Matters)

The following areas have **not yet been examined** and each carries meaningful production risk:

---

### 1. 🔴 Refresh Token Accumulation — No Cleanup Job

**File**: [`AuthController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/auth/controller/AuthController.java#L162-L178)

Every login and every token refresh creates a new `RefreshToken` row in the database. The old token is marked `revoked = true` but **never deleted**. Over time:
- A user who logs in daily for a year creates 365+ rows.
- The `refresh_tokens` table grows unboundedly.
- Token validation queries (`findByJti`) scan an ever-growing table.

**Needs**: A scheduled `@Scheduled(cron = "0 0 3 * * *")` cleanup job to delete expired/revoked tokens older than N days.

---

### 2. 🔴 `verify-2fa` Does NOT Verify the MFA Token Type

**File**: [`AuthController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/auth/controller/AuthController.java#L89)

```java
UUID userId = jwtService.getUserId(mfaToken);
// ← no call to jwtService.isAccessToken() or check for typ == "mfa"
```

A regular access token (type `"access"`) can be passed as `mfaToken` and the server will accept it — extracting the userId from it and granting full login. The `mfa` token type is generated but never validated.

**Fix**: Add `if (!jwtService.isMfaToken(mfaToken)) throw new BadCredentialsException("Invalid MFA token");` at the top of `verify2fa`.

---

### 3. 🔴 OAuth2 Success Handler Sends Access Token in `postMessage` to `"*"` Origin

**File**: [`OAuth2SuccessHandler.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/auth/security/OAuth2SuccessHandler.java#L156)

```java
"window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', payload: " + payloadJson + " }, '*');"
```

The `postMessage` target is `"*"` — any origin. The payload contains both the `accessToken` and `refreshToken` in full. Any malicious page that opened the OAuth popup (or navigated to it) can receive these tokens.

**Fix**: Replace `"*"` with the specific frontend origin from config:
```java
"window.opener.postMessage({ ... }, '" + allowedFrontendOrigin + "');"
```
This requires wiring in `${app.cors.allowed-origins}` (already defined in `WebConfig`).

---

### 4. 🔴 GitHub OAuth Falls Back to Fake Email on Private Accounts

**File**: [`OAuth2SuccessHandler.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/auth/security/OAuth2SuccessHandler.java#L94-L95)

```java
if (email == null) {
    email = name + "@github.com";  // e.g., "dheeraj080@github.com"
}
```

GitHub users can make their email private. The fallback creates a fake, non-existent email address. This:
- Allows multiple different GitHub users to collide if they have the same login name.
- Sends activation emails to addresses like `dheeraj080@github.com` that don't exist.
- Violates GDPR — you're storing a fabricated personal identifier.

**Fix**: Use GitHub's `/user/emails` API (requires the `user:email` scope, which is already configured) to fetch the primary verified email. If still null, return an OAuth error asking the user to make their email public.

---

### 5. 🔴 `GlobalExceptionHandler` Leaks Internal Stack Traces in Production

**File**: [`GlobalExceptionHandler.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/auth/exceptions/GlobalExceptionHandler.java#L85-L90)

```java
ErrorResponse error = new ErrorResponse(
    exception.getMessage(), // ← raw internal message sent to client
    HttpStatus.INTERNAL_SERVER_ERROR,
    500
);
```

The comment above this line says `"Temporarily return the ACTUAL message to Postman for debugging"` — this is shipping to production. Internal Java exception messages (e.g., `Cannot execute JPQL query ... constraint violation on column X`) expose schema, table names, and implementation details to clients.

**Fix**:
```java
log.error("Unhandled exception", exception);
// In production, return a generic message
ErrorResponse error = new ErrorResponse("An unexpected error occurred. Please try again.", ...);
```

---

### 6. 🔴 `SecurityConfig` Permits All `/api/v1/analytics/**` Without Auth

**File**: [`SecurityConfig.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/auth/config/SecurityConfig.java#L49)

```java
.requestMatchers("/api/public", "/api/v1/analytics/**").permitAll()
```

This was presumably done to allow the tracking pixel (`/track/open/`) and click redirect (`/track/click/`) to work without auth (correct — they're called by email clients). However, it also publicly exposes:
- `GET /api/v1/analytics/stats` — returns any user's email analytics if their userId is known
- `GET /api/v1/analytics/contact?email=...` — exposes per-contact analytics to anyone
- `POST /api/v1/analytics/events` — allows anyone to inject fake analytics events

**Fix**: Apply `permitAll()` only to the specific tracking sub-paths:
```java
.requestMatchers("/api/v1/analytics/track/**").permitAll()
.requestMatchers("/api/v1/analytics/**").authenticated()
```

---

### 7. 🔴 Actuator Endpoints Are Fully Open

**File**: [`SecurityConfig.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/auth/config/SecurityConfig.java#L50) and [`application.properties`](file:///d:/Projekt/EmILY/src/main/resources/application.properties#L84)

```java
.requestMatchers("/actuator/**").permitAll()
```
```properties
management.endpoints.web.exposure.include=*
```

All Spring Boot Actuator endpoints are exposed publicly with no authentication. This includes:
- `/actuator/env` — exposes all environment variables (including partial secrets)
- `/actuator/beans` — full Spring context dump
- `/actuator/heapdump` — full JVM heap download (contains in-memory secrets and user data)
- `/actuator/shutdown` — can shut down the application (if enabled)
- `/actuator/loggers` — allows changing log levels at runtime

**Fix**:
1. Restrict actuator access to `ADMIN` role or an internal network.
2. Limit exposed endpoints:
```properties
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
```

---

### 8. 🟠 No Database Migration Tool — Using `ddl-auto=update`

**File**: [`application.properties`](file:///d:/Projekt/EmILY/src/main/resources/application.properties#L24)

```properties
spring.jpa.hibernate.ddl-auto=update
```

Hibernate's `update` mode:
- **Adds** new columns/tables ✅
- **Never removes** old columns/tables ✅ (safe for some changes)
- **Cannot rename** columns (creates a new one and leaves the old one)
- **Cannot change** column types without data migration
- **Race condition risk** in clustered deployments — two app instances starting simultaneously can both try to `ALTER TABLE` at once

For production with real user data, this is dangerous. A botched schema auto-update can corrupt data without any rollback capability.

**Fix**: Migrate to **Flyway** or **Liquibase**:
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```
```properties
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
```

---

### 9. 🟠 `ContactService` Uses `@Cacheable` But Cache Keys Are Not Scoped by User

**File**: [`ContactService.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/contact/service/ContactService.java#L27-L41)

The `createContacts()` bulk method uses `@CacheEvict(value = "contacts", allEntries = true)`. However, `getAllUserContacts` and `getSelectedContacts` don't actually have `@Cacheable` annotations — they're not cached at all. The cache is being evicted on writes but **never populated on reads**, making all the `@CacheEvict` annotations pure overhead with no benefit.

Additionally, `toggleSelection` and `bulkSelect` both evict with `allEntries = true` — clearing the entire cache for all users, not just the one who changed.

**Fix**: Add `@Cacheable` to the read methods, or remove all `@CacheEvict` annotations and the `CacheConfig` bean entirely since it provides zero value in the current state.

---

### 10. 🟠 No Input Validation on Email Body (XSS/HTML Injection)

**Files**: [`EmailController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/email/controller/EmailController.java#L80), [`ContactController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/contact/controller/ContactController.java#L103)

The `request.body()` in `EmailRequest` is accepted as arbitrary HTML and is sent verbatim as the email body. There is no:
- HTML sanitization (can be used to send phishing emails through your infrastructure)
- Content size limit beyond the 5MB multipart limit
- Script injection prevention (if the body is ever rendered in a web view)

The platform allows authenticated users to compose arbitrary HTML and send it through your SMTP relay. This is an **email abuse vector** — a compromised account can send phishing/malware campaigns via your sending domain.

**Fix**: 
- Implement HTML sanitization using OWASP's Java HTML Sanitizer before sending.
- Set a reasonable body size limit (e.g., 500KB) at the API level.
- Track and alert on high-volume sends per user.

---

### 11. 🟠 `ContactController.bulkSelect` Has No Ownership Validation

**File**: [`ContactController.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/contact/controller/ContactController.java#L83-L91)

```java
public ResponseEntity<Void> bulkSelect(@RequestBody BulkSelectionRequest request, ...) {
    contactService.bulkSelect(request.contactIds(), request.selected());
    // Comment: "Optional: Add logic here to ensure the IDs provided belong to the requesting userId"
}
```

The comment explicitly acknowledges this is unvalidated. Any authenticated user can pass arbitrary contact UUIDs and toggle their `selected` status — affecting other users' contact lists. Since the broadcast feature relies on `getSelectedContacts()`, this is an indirect **privilege escalation** — a user can select other users' contacts for broadcast.

**Fix**: Pass `principal.id()` to `bulkSelect` and add a `WHERE userId = :userId` constraint in the repository query.

---

### 12. 🟠 `docker-compose.yml` Uses `postgres:latest` and `redis:latest` (Floating Tags)

**File**: [`docker-compose.yml`](file:///d:/Projekt/EmILY/docker-compose.yml#L5)

```yaml
image: postgres:latest
image: redis:latest
```

Floating `latest` tags mean the exact version can change on any `docker pull`. A Postgres minor version bump that changes default encoding or collation can break schema initialization. A Redis major version bump can change persistence behavior.

**Fix**: Pin to specific versions:
```yaml
image: postgres:16.3-alpine
image: redis:7.2-alpine
```

---

### 13. 🟠 `docker-compose.yml` PostgreSQL Volume Path Is Incorrect

**File**: [`docker-compose.yml`](file:///d:/Projekt/EmILY/docker-compose.yml#L16)

```yaml
volumes:
  - pgdata:/var/lib/postgresql   # ← WRONG
```

The correct data directory for the official `postgres` image is `/var/lib/postgresql/data`. The volume is mounted one level too high — Postgres may use a different path internally, and on some versions this results in data **not being persisted** across container restarts.

**Fix**:
```yaml
volumes:
  - pgdata:/var/lib/postgresql/data
```

---

### 14. 🟠 Test Suite Does Not Cover the Critical Email Provider Flow

**Files**: `src/test/` directory

The existing tests cover:
- ✅ Full contact CRUD integration (`EmIlyIntegrationTest`)
- ✅ Auth login/registration (`AuthIntegrationTest`)
- ✅ Analytics events (`AnalyticsIntegrationTest`)
- ✅ Rate limiting (`RateLimitingIntegrationTest`)
- ✅ TOTP verification (`TotpServiceTest`)

**Missing tests**:
- ❌ `MailSenderStrategy` implementations — no tests for Resend, SendGrid, Brevo, Mailgun, Postmark
- ❌ `EmailConfigController` test/save flow
- ❌ `EmailService.sendEmail()` with CC/BCC (catches the bug found in Issue #10 of pipeline review)
- ❌ `EmailJob.executeInternal()` — Quartz job execution with/without attachments
- ❌ Provider selection routing (the dead `MailSenderFactory` dispatch)
- ❌ Analytics tracking endpoints (`/track/open`, `/track/click`, `/track/unsubscribe`)
- ❌ Draft CRUD lifecycle
- ❌ Template IDOR (ownership validation)

---

### 15. 🟡 No Frontend Dockerfile

**Root**: [`docker-compose.yml`](file:///d:/Projekt/EmILY/docker-compose.yml#L78-L82)

```yaml
email-frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile   # ← this file does not exist
```

`docker-compose up` will fail when trying to build the frontend service. There is no `frontend/Dockerfile`.

**Fix**: Create `frontend/Dockerfile`:
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

---

### 16. 🟡 JWT Secret Is Hard-Coded in `JwtService` and in Tests

**File**: [`JwtService.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/auth/security/JwtService.java#L32)

```java
this.secret = env.getProperty("security.jwt.secret", 
    "vS9p8u2M5rX7n4Q1z6W0E3t9Y4A8S5D2F1G7H3J6K9L0P3M1N4B7V2C5X8Z1Q9W0");
```

This default secret is committed in source code. If the `security.jwt.secret` env var is ever missing from a deployment, the hardcoded default is silently used — and it's now public knowledge since it's in the repo. All JWTs signed with this key are compromised.

**Fix**: Remove the default value. Throw on startup if the secret is missing:
```java
this.secret = Objects.requireNonNull(
    env.getProperty("security.jwt.secret"),
    "security.jwt.secret must be configured"
);
```

---

### 17. 🟡 `app.cors.allowed-origins` Has No Default Configured in `application.properties`

**File**: [`WebConfig.java`](file:///d:/Projekt/EmILY/src/main/java/com/em/emily/auth/config/WebConfig.java#L22)

```java
@Value("${app.cors.allowed-origins:http://localhost:3001}")
```

The CORS origin defaults to `localhost:3001`. The frontend runs on port `3000` (per `docker-compose.yml`). In production on Render, the frontend URL is injected via `APP_CORS_ALLOWED_ORIGINS` — but there is no env var with that exact name defined. The Render config uses `APP_CORS_ALLOWED_ORIGINS` but the property key referenced is `app.cors.allowed-origins` — Spring maps `APP_CORS_ALLOWED_ORIGINS` → `app.cors.allowed-origins` automatically, but this is fragile and undocumented.

**Fix**: Add to `application.properties`:
```properties
app.cors.allowed-origins=${APP_CORS_ALLOWED_ORIGINS:http://localhost:3000}
```
And update the default dev port from `3001` to `3000`.

---

### 18. 🟡 No Health Check Endpoint Beyond Actuator

The `render.yaml` has no health check path configured. Render uses the default HTTP check on `/`. The Spring Boot default for `/` returns 404. This means Render may incorrectly mark the service as unhealthy.

**Fix**: Configure health check in Render or add a root `/` handler:
```yaml
# render.yaml
healthCheckPath: /actuator/health
```
But this only works once the actuator is secured (see Issue #7 above).

---

### 19. 🟡 No Structured Logging / Correlation IDs

The codebase uses SLF4J + Logback with default format. In production:
- Logs from async threads (`@Async("taskExecutor")`) have no correlation to the originating request.
- No trace IDs propagate across RabbitMQ message boundaries.
- No structured JSON logging for log aggregation tools (Datadog, Loki, CloudWatch).

**Fix**: Add Spring's MDC filter to attach a request ID to every log line, and configure JSON logging for production:
```xml
<!-- logback-spring.xml -->
<springProfile name="prod">
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>
</springProfile>
```

---

### 20. 🟡 No API Versioning Strategy Beyond the Current `/api/v1/` Prefix

All routes are `v1`. There is no deprecation mechanism, no version negotiation, and no plan for `v2` migrations. Since the frontend is tightly coupled to these routes, any breaking change requires simultaneous frontend+backend deployment.

**Needs**: Document the versioning policy and wire a `Deprecated` header on any endpoint planned for change.

---

## Road to Production — Phased Plan

### Phase 1 — Stop the Bleeding (Security) — 1–2 days
1. Fix `postMessage` target from `"*"` to the specific frontend origin
2. Restrict `/actuator/**` to admin role or IP allowlist
3. Restrict `/api/v1/analytics/**` — only `track/**` should be public
4. Remove hardcoded JWT secret default
5. Fix `verify-2fa` to validate token type
6. Fix the GlobalExceptionHandler to not leak stack traces

### Phase 2 — Fix the Core Feature — 2–3 days
7. Wire provider selection: `EmailService` must read `EmailConfig` and route to `MailSenderStrategy`
8. Wrap `MailSenderStrategy` calls with logging + event publishing
9. Fix CC/BCC in `sendEmail()` non-attachment path
10. Fix `isMarketing` default for transactional emails
11. Add ownership checks to template and contact endpoints

### Phase 3 — Infrastructure Hardening — 1–2 days
12. Switch `ddl-auto=update` to Flyway
13. Pin Docker image versions
14. Fix `pgdata` volume mount path
15. Create `frontend/Dockerfile`
16. Add scheduled refresh-token cleanup job
17. Fix `showSuccess()` → `toast.success()`
18. Remove TRACE logging from default config

### Phase 4 — Observability & Quality — Ongoing
19. Add structured JSON logging with request correlation IDs
20. Write tests for all 5 HTTP email providers
21. Write tests for analytics tracking endpoints
22. Test ownership validation on template/contact CRUD
23. Add `@Cacheable` to analytics read paths (or remove `CacheConfig`)
24. Fix `PerformanceChart` timeframe selector

### Phase 5 — Polish
25. Migrate AES-ECB → AES-GCM for API key encryption
26. Add SMTP connection pooling in `SmtpMailSender`
27. Replace `JobDataMap` body storage with draft ID reference
28. Fix GitHub email fallback for private accounts
29. Add Mailgun domain field to `EmailConfig`
30. Fix `mock` adapter condition in `api.ts`
