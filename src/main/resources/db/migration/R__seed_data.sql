INSERT INTO roles (id, name)
VALUES
    (gen_random_uuid(), 'ROLE_USER'),
    (gen_random_uuid(), 'ROLE_ADMIN')
ON CONFLICT (name) DO NOTHING;
