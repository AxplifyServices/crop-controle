ALTER TABLE users
ADD COLUMN IF NOT EXISTS title VARCHAR(150),
ADD COLUMN IF NOT EXISTS job_title VARCHAR(150),
ADD COLUMN IF NOT EXISTS assignment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS assignment_id UUID;

CREATE INDEX IF NOT EXISTS idx_users_assignment
ON users(assignment_type, assignment_id);

CREATE INDEX IF NOT EXISTS idx_users_deleted_status
ON users(deleted_at, status);

INSERT INTO permissions(module, action, description)
VALUES
('profiles', 'VIEW', 'Voir les profils'),
('profiles', 'CREATE', 'Créer des profils'),
('profiles', 'UPDATE', 'Modifier des profils'),
('profiles', 'DELETE', 'Supprimer ou désactiver des profils'),
('profiles', 'ADMIN', 'Administrer les profils'),

('audit-logs', 'VIEW', 'Voir l’historique des logs'),
('audit-logs', 'EXPORT', 'Exporter l’historique des logs'),
('audit-logs', 'ADMIN', 'Administrer les logs'),

('users', 'VIEW', 'Voir les utilisateurs'),
('users', 'CREATE', 'Créer des utilisateurs'),
('users', 'UPDATE', 'Modifier des utilisateurs'),
('users', 'DELETE', 'Supprimer des utilisateurs'),

('roles', 'VIEW', 'Voir les rôles'),
('roles', 'CREATE', 'Créer des rôles'),
('roles', 'UPDATE', 'Modifier des rôles'),
('roles', 'DELETE', 'Supprimer des rôles'),

('permissions', 'VIEW', 'Voir les permissions'),
('permissions', 'UPDATE', 'Modifier les permissions')
ON CONFLICT ON CONSTRAINT uq_permissions_module_action DO NOTHING;

INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE LOWER(r.name) IN ('super_admin', 'super-admin', 'superadmin')
ON CONFLICT DO NOTHING;