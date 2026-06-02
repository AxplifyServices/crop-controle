ALTER TABLE plantations
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(6);

ALTER TABLE treatments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(6);

ALTER TABLE harvests
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(6);

ALTER TABLE productions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(6);

ALTER TABLE charges
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(6);

CREATE INDEX IF NOT EXISTS idx_plantations_deleted_at
ON plantations(deleted_at);

CREATE INDEX IF NOT EXISTS idx_treatments_deleted_at
ON treatments(deleted_at);

CREATE INDEX IF NOT EXISTS idx_harvests_deleted_at
ON harvests(deleted_at);

CREATE INDEX IF NOT EXISTS idx_productions_deleted_at
ON productions(deleted_at);

CREATE INDEX IF NOT EXISTS idx_charges_deleted_at
ON charges(deleted_at);

INSERT INTO permissions (module, action, description)
SELECT module_name, action_name::permission_action_enum, action_name || ' permission on ' || module_name
FROM (
  VALUES
    ('agricultural-projects'),
    ('plantations'),
    ('treatments'),
    ('harvests'),
    ('productions'),
    ('charges')
) AS modules(module_name)
CROSS JOIN (
  VALUES
    ('VIEW'),
    ('CREATE'),
    ('UPDATE'),
    ('DELETE'),
    ('VALIDATE'),
    ('EXPORT'),
    ('ADMIN')
) AS actions(action_name)
ON CONFLICT (module, action) DO UPDATE
SET description = EXCLUDED.description;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
  AND p.module IN (
    'agricultural-projects',
    'plantations',
    'treatments',
    'harvests',
    'productions',
    'charges'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;