-- Auth: roles, users, user_roles
CREATE TABLE roles (
    id   UUID        NOT NULL,
    name VARCHAR(64) NOT NULL,
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uq_roles_name UNIQUE (name)
);

CREATE TABLE users (
    user_id     UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_email  VARCHAR(255) NOT NULL,
    user_name   VARCHAR(255),
    password    VARCHAR(255),
    image       TEXT,
    enabled     BOOLEAN      NOT NULL DEFAULT FALSE,
    totp_secret TEXT,
    mfa_enabled BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    provider    VARCHAR(32)  NOT NULL DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (user_email)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

-- Auth Tokens
CREATE TABLE refresh_token (
    id                UUID         NOT NULL DEFAULT gen_random_uuid(),
    jti               VARCHAR(255) NOT NULL,
    user_id           UUID         NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL,
    expires_at        TIMESTAMPTZ  NOT NULL,
    revoked           BOOLEAN      NOT NULL DEFAULT FALSE,
    replaced_by_token VARCHAR(255),
    CONSTRAINT pk_refresh_token PRIMARY KEY (id),
    CONSTRAINT uq_refresh_token_jti UNIQUE (jti),
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);
CREATE INDEX refresh_token_jti_index ON refresh_token (jti);
CREATE INDEX refresh_token_user_id_idx ON refresh_token (user_id);

CREATE TABLE reset_password_token (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    code        VARCHAR(6)  NOT NULL,
    user_id     UUID        NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    used        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_reset_password_token PRIMARY KEY (id),
    CONSTRAINT fk_reset_password_token_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

-- Contacts
CREATE TABLE contact_groups (
    id          UUID          NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(255)  NOT NULL,
    description VARCHAR(1000),
    user_id     UUID          NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT pk_contact_groups PRIMARY KEY (id)
);

CREATE TABLE contacts (
    id          UUID          NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(255),
    email       VARCHAR(255)  NOT NULL,
    phone_no    VARCHAR(15),
    description VARCHAR(1000),
    user_id     UUID          NOT NULL,
    selected    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT pk_contacts PRIMARY KEY (id),
    CONSTRAINT uq_contacts_user_email UNIQUE (user_id, email)
);

CREATE TABLE contact_group_members (
    contact_id UUID NOT NULL,
    group_id   UUID NOT NULL,
    CONSTRAINT pk_contact_group_members PRIMARY KEY (contact_id, group_id),
    CONSTRAINT fk_cgm_contact FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE,
    CONSTRAINT fk_cgm_group FOREIGN KEY (group_id) REFERENCES contact_groups (id) ON DELETE CASCADE
);

-- Emails
CREATE TABLE email_log (
    id            BIGSERIAL    NOT NULL,
    user_id       UUID,
    recipient     VARCHAR(500) NOT NULL,
    subject       VARCHAR(255) NOT NULL,
    status        VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    sent_at       TIMESTAMPTZ,
    is_marketing  BOOLEAN      NOT NULL DEFAULT TRUE,
    error_message TEXT,
    CONSTRAINT pk_email_log PRIMARY KEY (id)
);
CREATE INDEX idx_email_log_user_id ON email_log (user_id);

CREATE TABLE email_configs (
    id                UUID          NOT NULL DEFAULT gen_random_uuid(),
    user_id           UUID          NOT NULL,
    provider_type     VARCHAR(32)   NOT NULL,
    from_email        VARCHAR(255)  NOT NULL,
    smtp_host         VARCHAR(255),
    smtp_port         INTEGER,
    smtp_username     VARCHAR(255),
    encrypted_api_key VARCHAR(1024),
    is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_email_configs PRIMARY KEY (id)
);
CREATE UNIQUE INDEX uq_email_configs_user ON email_configs (user_id);

CREATE TABLE email_templates (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    subject    VARCHAR(255),
    content    TEXT,
    user_id    UUID        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_email_templates PRIMARY KEY (id)
);
CREATE INDEX idx_email_templates_user ON email_templates (user_id);

CREATE TABLE email_drafts (
    id              BIGSERIAL    NOT NULL,
    user_id         UUID         NOT NULL,
    reply_to        VARCHAR(255),
    subject         VARCHAR(255) NOT NULL,
    body            TEXT,
    is_marketing    BOOLEAN      NOT NULL DEFAULT TRUE,
    cron_expression VARCHAR(255),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_email_drafts PRIMARY KEY (id)
);

CREATE TABLE draft_recipients (
    draft_id  BIGINT NOT NULL,
    recipient VARCHAR(255),
    CONSTRAINT fk_draft_recipients FOREIGN KEY (draft_id) REFERENCES email_drafts (id) ON DELETE CASCADE
);

CREATE TABLE draft_cc (
    draft_id     BIGINT NOT NULL,
    cc_recipient VARCHAR(255),
    CONSTRAINT fk_draft_cc FOREIGN KEY (draft_id) REFERENCES email_drafts (id) ON DELETE CASCADE
);

CREATE TABLE draft_bcc (
    draft_id      BIGINT NOT NULL,
    bcc_recipient VARCHAR(255),
    CONSTRAINT fk_draft_bcc FOREIGN KEY (draft_id) REFERENCES email_drafts (id) ON DELETE CASCADE
);

-- Analytics
CREATE TABLE email_analytics_event (
    id         BIGSERIAL   NOT NULL,
    email_id   BIGINT      NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    recipient  VARCHAR(255),
    timestamp  TIMESTAMP   NOT NULL,
    CONSTRAINT pk_email_analytics_event PRIMARY KEY (id)
);
CREATE INDEX idx_analytics_email_id ON email_analytics_event (email_id);
CREATE INDEX idx_analytics_event_type ON email_analytics_event (event_type);
CREATE INDEX idx_analytics_recipient ON email_analytics_event (recipient);
