BEGIN;

-- ============================================================
-- 1. Projet agricole lié à une culture
-- ============================================================

ALTER TABLE agricultural_projects
ADD COLUMN IF NOT EXISTS culture_id UUID;

ALTER TABLE agricultural_projects
ADD CONSTRAINT fk_agricultural_projects_culture
FOREIGN KEY (culture_id)
REFERENCES cultures(id)
ON UPDATE NO ACTION
ON DELETE NO ACTION;

CREATE INDEX IF NOT EXISTS idx_agricultural_projects_culture_id
ON agricultural_projects(culture_id);

-- Reprise des cultures existantes depuis le produit actuel.
UPDATE agricultural_projects ap
SET culture_id = p.culture_id
FROM products p
WHERE ap.product_id = p.id
  AND ap.culture_id IS NULL
  AND p.culture_id IS NOT NULL;

-- Les anciennes colonnes restent temporairement présentes pour
-- éviter de casser les récoltes et productions déjà existantes.
-- Elles deviennent toutefois optionnelles.

ALTER TABLE agricultural_projects
ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE agricultural_projects
ALTER COLUMN variety_id DROP NOT NULL;

-- ============================================================
-- 2. Association projets / parcelles
-- ============================================================

CREATE TABLE IF NOT EXISTS agricultural_project_plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    project_id UUID NOT NULL,
    plot_id UUID NOT NULL,

    created_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_agricultural_project_plots_project
        FOREIGN KEY (project_id)
        REFERENCES agricultural_projects(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT fk_agricultural_project_plots_plot
        FOREIGN KEY (plot_id)
        REFERENCES plots(id)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,

    CONSTRAINT uq_agricultural_project_plots
        UNIQUE (project_id, plot_id)
);

CREATE INDEX IF NOT EXISTS idx_agricultural_project_plots_project_id
ON agricultural_project_plots(project_id);

CREATE INDEX IF NOT EXISTS idx_agricultural_project_plots_plot_id
ON agricultural_project_plots(plot_id);

-- Migration des anciennes affectations.
INSERT INTO agricultural_project_plots (
    project_id,
    plot_id
)
SELECT
    id,
    plot_id
FROM agricultural_projects
WHERE plot_id IS NOT NULL
ON CONFLICT (project_id, plot_id) DO NOTHING;

-- ============================================================
-- 3. Plantation liée à une culture
-- ============================================================

ALTER TABLE plantations
ADD COLUMN IF NOT EXISTS culture_id UUID;

ALTER TABLE plantations
ADD CONSTRAINT fk_plantations_culture
FOREIGN KEY (culture_id)
REFERENCES cultures(id)
ON UPDATE NO ACTION
ON DELETE NO ACTION;

CREATE INDEX IF NOT EXISTS idx_plantations_culture_id
ON plantations(culture_id);

UPDATE plantations pl
SET culture_id = ap.culture_id
FROM agricultural_projects ap
WHERE pl.project_id = ap.id
  AND pl.culture_id IS NULL
  AND ap.culture_id IS NOT NULL;

-- Le produit et la variété ne sont plus obligatoires pour une plantation.
ALTER TABLE plantations
ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE plantations
ALTER COLUMN variety_id DROP NOT NULL;

COMMIT;