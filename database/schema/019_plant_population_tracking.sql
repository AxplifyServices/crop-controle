BEGIN;

-- ============================================================
-- 1. Projet agricole
-- ============================================================
ALTER TABLE agricultural_projects
DROP CONSTRAINT IF EXISTS chk_agricultural_projects_active_plant_count;

ALTER TABLE agricultural_projects
  RENAME COLUMN plant_count TO planned_plant_count;

UPDATE agricultural_projects
SET active_plant_count = 0
WHERE active_plant_count IS NULL;

ALTER TABLE agricultural_projects
  ALTER COLUMN active_plant_count SET DEFAULT 0,
  ALTER COLUMN active_plant_count SET NOT NULL;

ALTER TABLE agricultural_projects
  ADD CONSTRAINT chk_agricultural_projects_planned_plant_count
  CHECK (planned_plant_count >= 0);

ALTER TABLE agricultural_projects
  ADD CONSTRAINT chk_agricultural_projects_active_plant_count
  CHECK (active_plant_count >= 0);

-- ============================================================
-- 2. Nouveau type d’opération de plantation
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'plantation_operation_type_enum'
  ) THEN
    CREATE TYPE plantation_operation_type_enum AS ENUM (
      'INITIAL',
      'REPLACEMENT',
      'ADDITIONAL'
    );
  END IF;
END
$$;

ALTER TABLE plantations
  ADD COLUMN operation_type plantation_operation_type_enum;

UPDATE plantations
SET operation_type =
  CASE
    WHEN category::text = 'RENEWAL' THEN
      'REPLACEMENT'::plantation_operation_type_enum
    ELSE
      'INITIAL'::plantation_operation_type_enum
  END
WHERE operation_type IS NULL;

ALTER TABLE plantations
  ALTER COLUMN operation_type SET DEFAULT 'INITIAL',
  ALTER COLUMN operation_type SET NOT NULL;

-- ============================================================
-- 3. Surface plantée et densité calculée
-- ============================================================

ALTER TABLE plantations
  ADD COLUMN planted_surface_ha NUMERIC(12, 2);

ALTER TABLE plantations
  RENAME COLUMN density TO density_per_ha;

ALTER TABLE plantations
  ALTER COLUMN density_per_ha TYPE NUMERIC(14, 2)
  USING density_per_ha::NUMERIC(14, 2);

ALTER TABLE plantations
  ADD CONSTRAINT chk_plantations_plant_quantity_positive
  CHECK (plant_quantity > 0);

ALTER TABLE plantations
  ADD CONSTRAINT chk_plantations_planted_surface_positive
  CHECK (
    planted_surface_ha IS NULL
    OR planted_surface_ha > 0
  );

ALTER TABLE plantations
  ADD CONSTRAINT chk_plantations_density_positive
  CHECK (
    density_per_ha IS NULL
    OR density_per_ha >= 0
  );

-- L’ancienne catégorie n’est plus utile.
ALTER TABLE plantations
  DROP COLUMN category;

DROP TYPE IF EXISTS plantation_category_enum;

-- ============================================================
-- 4. Types de mouvements affectant le peuplement
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'plant_movement_type_enum'
  ) THEN
    CREATE TYPE plant_movement_type_enum AS ENUM (
      'MORTALITY',
      'UPROOTING',
      'NON_PRODUCTIVE',
      'REACTIVATION',
      'POSITIVE_ADJUSTMENT',
      'NEGATIVE_ADJUSTMENT'
    );
  END IF;
END
$$;

-- ============================================================
-- 5. Historique des mouvements de plantes
-- ============================================================

CREATE TABLE IF NOT EXISTS plant_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  project_id UUID NOT NULL,

  movement_date DATE NOT NULL,

  type plant_movement_type_enum NOT NULL,

  plant_count INTEGER NOT NULL,

  reason VARCHAR(200),

  observations TEXT,

  created_by_id UUID,

  created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),

  deleted_at TIMESTAMP(6),

  CONSTRAINT fk_plant_movements_project
    FOREIGN KEY (project_id)
    REFERENCES agricultural_projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_plant_movements_created_by
    FOREIGN KEY (created_by_id)
    REFERENCES users(id)
    ON DELETE SET NULL,

  CONSTRAINT chk_plant_movements_plant_count_positive
    CHECK (plant_count > 0)
);

CREATE INDEX IF NOT EXISTS idx_plant_movements_project_id
  ON plant_movements(project_id);

CREATE INDEX IF NOT EXISTS idx_plant_movements_movement_date
  ON plant_movements(movement_date);

CREATE INDEX IF NOT EXISTS idx_plant_movements_type
  ON plant_movements(type);

CREATE INDEX IF NOT EXISTS idx_plant_movements_deleted_at
  ON plant_movements(deleted_at);

-- ============================================================
-- 6. Initialisation des plantes actives avec les plantations
--    existantes
-- ============================================================

UPDATE agricultural_projects project
SET active_plant_count = COALESCE(plantations.total_planted, 0)
FROM (
  SELECT
    project_id,
    SUM(plant_quantity)::INTEGER AS total_planted
  FROM plantations
  WHERE deleted_at IS NULL
  GROUP BY project_id
) plantations
WHERE project.id = plantations.project_id;

UPDATE agricultural_projects project
SET active_plant_count = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM plantations plantation
  WHERE plantation.project_id = project.id
    AND plantation.deleted_at IS NULL
);

COMMIT;