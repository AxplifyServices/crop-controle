-- 018_farms_factories_geography_ids.sql
-- Normalisation géographique des fermes et usines.
-- Objectif : aligner farms/factories avec companies via country_id, region_id, city_id.

ALTER TABLE farms
ADD COLUMN IF NOT EXISTS country_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS region_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS city_id VARCHAR(80);

ALTER TABLE factories
ADD COLUMN IF NOT EXISTS country_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS region_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS city_id VARCHAR(80);

CREATE INDEX IF NOT EXISTS idx_farms_country_id ON farms(country_id);
CREATE INDEX IF NOT EXISTS idx_farms_region_id ON farms(region_id);
CREATE INDEX IF NOT EXISTS idx_farms_city_id ON farms(city_id);

CREATE INDEX IF NOT EXISTS idx_factories_country_id ON factories(country_id);
CREATE INDEX IF NOT EXISTS idx_factories_region_id ON factories(region_id);
CREATE INDEX IF NOT EXISTS idx_factories_city_id ON factories(city_id);

-- Tentative de reprise automatique depuis les anciennes valeurs texte.
UPDATE farms f
SET
  country_id = g.country_id,
  region_id = g.region_id,
  city_id = g.city_id,
  country = g.country_name,
  region = g.region_name,
  city = g.city_name,
  updated_at = NOW()
FROM geography_locations g
WHERE f.city_id IS NULL
  AND f.city IS NOT NULL
  AND LOWER(TRIM(f.city)) = LOWER(TRIM(g.city_name))
  AND (
    f.region IS NULL
    OR LOWER(TRIM(f.region)) = LOWER(TRIM(g.region_name))
  );

UPDATE factories f
SET
  country_id = g.country_id,
  region_id = g.region_id,
  city_id = g.city_id,
  country = g.country_name,
  region = g.region_name,
  city = g.city_name,
  updated_at = NOW()
FROM geography_locations g
WHERE f.city_id IS NULL
  AND f.city IS NOT NULL
  AND LOWER(TRIM(f.city)) = LOWER(TRIM(g.city_name))
  AND (
    f.region IS NULL
    OR LOWER(TRIM(f.region)) = LOWER(TRIM(g.region_name))
  );