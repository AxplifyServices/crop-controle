-- 016_align_phase2_front_with_database.sql
-- Objectif :
-- 1) Aligner company_status_enum avec le front : ACTIVE, INACTIVE, ARCHIVED
-- 2) Aligner vehicle_type_enum avec le front : ajout COMPANY_CAR
-- 3) Ajouter country aux fermes et usines pour rendre les filtres pays fiables

-- 1. Entreprises : autoriser ARCHIVED
ALTER TYPE company_status_enum ADD VALUE IF NOT EXISTS 'ARCHIVED';

-- 2. Véhicules : autoriser COMPANY_CAR
ALTER TYPE vehicle_type_enum ADD VALUE IF NOT EXISTS 'COMPANY_CAR';

-- 3. Fermes : ajouter le pays
ALTER TABLE farms
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- 4. Usines : ajouter le pays
ALTER TABLE factories
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- 5. Renseigner le pays des fermes existantes à partir de leur entreprise
UPDATE farms f
SET country = COALESCE(c.country, 'Maroc')
FROM companies c
WHERE f.company_id = c.id
  AND (f.country IS NULL OR f.country = '');

-- 6. Renseigner le pays des usines existantes à partir de leur entreprise
UPDATE factories fa
SET country = COALESCE(c.country, 'Maroc')
FROM companies c
WHERE fa.company_id = c.id
  AND (fa.country IS NULL OR fa.country = '');

-- 7. Valeur de secours pour les anciennes lignes sans entreprise exploitable
UPDATE farms
SET country = 'Maroc'
WHERE country IS NULL OR country = '';

UPDATE factories
SET country = 'Maroc'
WHERE country IS NULL OR country = '';

-- 8. Index pour les filtres
CREATE INDEX IF NOT EXISTS idx_farms_country ON farms(country);
CREATE INDEX IF NOT EXISTS idx_factories_country ON factories(country);