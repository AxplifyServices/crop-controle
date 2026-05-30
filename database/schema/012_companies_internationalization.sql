CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 1. Geography reference table
-- One row = one city
-- =========================================================

CREATE TABLE IF NOT EXISTS geography_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  country_id VARCHAR(20) NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  country_name_fr VARCHAR(150) NOT NULL,
  country_name_en VARCHAR(150) NOT NULL,
  country_name_es VARCHAR(150) NOT NULL,

  region_id VARCHAR(50) NOT NULL,
  region_code VARCHAR(80) NOT NULL,
  region_name_fr VARCHAR(150) NOT NULL,
  region_name_en VARCHAR(150) NOT NULL,
  region_name_es VARCHAR(150) NOT NULL,

  city_id VARCHAR(80) NOT NULL,
  city_name_fr VARCHAR(150) NOT NULL,
  city_name_en VARCHAR(150) NOT NULL,
  city_name_es VARCHAR(150) NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT uq_geography_locations_city UNIQUE (country_code, region_code, city_id)
);

CREATE INDEX IF NOT EXISTS idx_geography_locations_country_code
ON geography_locations(country_code);

CREATE INDEX IF NOT EXISTS idx_geography_locations_region_code
ON geography_locations(region_code);

CREATE INDEX IF NOT EXISTS idx_geography_locations_city_id
ON geography_locations(city_id);

-- =========================================================
-- 2. Add normalized geography columns to companies
-- =========================================================

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS country_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS region_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS city_id VARCHAR(80);

CREATE INDEX IF NOT EXISTS idx_companies_country_id
ON companies(country_id);

CREATE INDEX IF NOT EXISTS idx_companies_region_id
ON companies(region_id);

CREATE INDEX IF NOT EXISTS idx_companies_city_id
ON companies(city_id);

-- =========================================================
-- 3. Legal identifier type configuration per country
-- =========================================================

CREATE TABLE IF NOT EXISTS country_legal_identifier_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  country_code VARCHAR(10) NOT NULL,
  identifier_type VARCHAR(80) NOT NULL,

  label_fr VARCHAR(150) NOT NULL,
  label_en VARCHAR(150) NOT NULL,
  label_es VARCHAR(150) NOT NULL,

  placeholder_fr VARCHAR(200),
  placeholder_en VARCHAR(200),
  placeholder_es VARCHAR(200),

  description_fr TEXT,
  description_en TEXT,
  description_es TEXT,

  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  validation_regex TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT uq_country_legal_identifier_type UNIQUE (country_code, identifier_type)
);

CREATE INDEX IF NOT EXISTS idx_country_legal_identifier_types_country_code
ON country_legal_identifier_types(country_code);

CREATE INDEX IF NOT EXISTS idx_country_legal_identifier_types_active
ON country_legal_identifier_types(is_active);

-- =========================================================
-- 4. Legal identifiers attached to companies
-- =========================================================

CREATE TABLE IF NOT EXISTS company_legal_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  company_id UUID NOT NULL,
  country_code VARCHAR(10) NOT NULL,
  identifier_type VARCHAR(80) NOT NULL,
  identifier_value VARCHAR(200),

  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  CONSTRAINT fk_company_legal_identifiers_company
    FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_company_legal_identifiers_type
    FOREIGN KEY (country_code, identifier_type)
    REFERENCES country_legal_identifier_types(country_code, identifier_type)
    ON DELETE RESTRICT,

  CONSTRAINT uq_company_legal_identifier UNIQUE (company_id, country_code, identifier_type)
);

CREATE INDEX IF NOT EXISTS idx_company_legal_identifiers_company_id
ON company_legal_identifiers(company_id);

CREATE INDEX IF NOT EXISTS idx_company_legal_identifiers_country_type
ON company_legal_identifiers(country_code, identifier_type);

-- =========================================================
-- 5. Seed legal identifier types
-- =========================================================

INSERT INTO country_legal_identifier_types (
  country_code,
  identifier_type,
  label_fr,
  label_en,
  label_es,
  placeholder_fr,
  placeholder_en,
  placeholder_es,
  is_required,
  display_order,
  validation_regex
)
VALUES
-- Morocco
(
  'MA',
  'ICE',
  'ICE',
  'ICE',
  'ICE',
  'Ex : 001234567000089',
  'Example: 001234567000089',
  'Ejemplo: 001234567000089',
  TRUE,
  10,
  '^[0-9]{15}$'
),
(
  'MA',
  'TAX_ID',
  'Identifiant fiscal',
  'Tax identifier',
  'Identificador fiscal',
  'Ex : 12345678',
  'Example: 12345678',
  'Ejemplo: 12345678',
  FALSE,
  20,
  NULL
),
(
  'MA',
  'RC',
  'RC',
  'Commercial register',
  'Registro mercantil',
  'Ex : 12345',
  'Example: 12345',
  'Ejemplo: 12345',
  FALSE,
  30,
  NULL
),
(
  'MA',
  'CNSS',
  'CNSS',
  'Social security number',
  'Número de seguridad social',
  'Ex : 1234567',
  'Example: 1234567',
  'Ejemplo: 1234567',
  FALSE,
  40,
  NULL
),
(
  'MA',
  'PATENTE',
  'Patente',
  'Business tax number',
  'Número de patente',
  'Ex : 12345678',
  'Example: 12345678',
  'Ejemplo: 12345678',
  FALSE,
  50,
  NULL
),

-- Spain
(
  'ES',
  'NIF',
  'NIF',
  'NIF',
  'NIF',
  'Ex : B12345678',
  'Example: B12345678',
  'Ejemplo: B12345678',
  TRUE,
  10,
  '^[A-Z0-9][0-9]{7}[A-Z0-9]$'
),
(
  'ES',
  'CIF',
  'CIF',
  'CIF',
  'CIF',
  'Ex : B12345678',
  'Example: B12345678',
  'Ejemplo: B12345678',
  FALSE,
  20,
  '^[A-Z][0-9]{7}[A-Z0-9]$'
),
(
  'ES',
  'VAT_INTRACOMMUNITY',
  'TVA intracommunautaire',
  'Intra-community VAT',
  'IVA intracomunitario',
  'Ex : ESB12345678',
  'Example: ESB12345678',
  'Ejemplo: ESB12345678',
  FALSE,
  30,
  '^ES[A-Z0-9]{8,12}$'
),
(
  'ES',
  'REGISTRO_MERCANTIL',
  'Registro Mercantil',
  'Commercial register',
  'Registro Mercantil',
  'Ex : Madrid, Tomo 12345, Folio 67',
  'Example: Madrid, Volume 12345, Folio 67',
  'Ejemplo: Madrid, Tomo 12345, Folio 67',
  FALSE,
  40,
  NULL
),
(
  'ES',
  'SEGURIDAD_SOCIAL',
  'Seguridad Social',
  'Social security',
  'Seguridad Social',
  'Ex : numéro de cotisation',
  'Example: contribution account number',
  'Ejemplo: código de cuenta de cotización',
  FALSE,
  50,
  NULL
),
(
  'ES',
  'IAE',
  'IAE',
  'IAE',
  'IAE',
  'Ex : activité économique',
  'Example: economic activity',
  'Ejemplo: actividad económica',
  FALSE,
  60,
  NULL
),
(
  'ES',
  'CNAE',
  'CNAE',
  'CNAE',
  'CNAE',
  'Ex : 0113',
  'Example: 0113',
  'Ejemplo: 0113',
  FALSE,
  70,
  '^[0-9]{4}$'
)
ON CONFLICT (country_code, identifier_type) DO UPDATE
SET
  label_fr = EXCLUDED.label_fr,
  label_en = EXCLUDED.label_en,
  label_es = EXCLUDED.label_es,
  placeholder_fr = EXCLUDED.placeholder_fr,
  placeholder_en = EXCLUDED.placeholder_en,
  placeholder_es = EXCLUDED.placeholder_es,
  is_required = EXCLUDED.is_required,
  display_order = EXCLUDED.display_order,
  validation_regex = EXCLUDED.validation_regex,
  updated_at = now();

-- =========================================================
-- 6. Optional migration from old Moroccan columns
-- This keeps existing Moroccan identifiers usable.
-- =========================================================

INSERT INTO company_legal_identifiers (
  company_id,
  country_code,
  identifier_type,
  identifier_value
)
SELECT id, 'MA', 'ICE', ice
FROM companies
WHERE ice IS NOT NULL AND ice <> ''
ON CONFLICT (company_id, country_code, identifier_type) DO UPDATE
SET identifier_value = EXCLUDED.identifier_value,
    updated_at = now();

INSERT INTO company_legal_identifiers (
  company_id,
  country_code,
  identifier_type,
  identifier_value
)
SELECT id, 'MA', 'TAX_ID', tax_id
FROM companies
WHERE tax_id IS NOT NULL AND tax_id <> ''
ON CONFLICT (company_id, country_code, identifier_type) DO UPDATE
SET identifier_value = EXCLUDED.identifier_value,
    updated_at = now();

INSERT INTO company_legal_identifiers (
  company_id,
  country_code,
  identifier_type,
  identifier_value
)
SELECT id, 'MA', 'RC', rc
FROM companies
WHERE rc IS NOT NULL AND rc <> ''
ON CONFLICT (company_id, country_code, identifier_type) DO UPDATE
SET identifier_value = EXCLUDED.identifier_value,
    updated_at = now();

INSERT INTO company_legal_identifiers (
  company_id,
  country_code,
  identifier_type,
  identifier_value
)
SELECT id, 'MA', 'CNSS', cnss
FROM companies
WHERE cnss IS NOT NULL AND cnss <> ''
ON CONFLICT (company_id, country_code, identifier_type) DO UPDATE
SET identifier_value = EXCLUDED.identifier_value,
    updated_at = now();

INSERT INTO company_legal_identifiers (
  company_id,
  country_code,
  identifier_type,
  identifier_value
)
SELECT id, 'MA', 'PATENTE', patente
FROM companies
WHERE patente IS NOT NULL AND patente <> ''
ON CONFLICT (company_id, country_code, identifier_type) DO UPDATE
SET identifier_value = EXCLUDED.identifier_value,
    updated_at = now();