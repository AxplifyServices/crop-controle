BEGIN;

CREATE TABLE IF NOT EXISTS cultures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  status entity_status_enum NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cultures_status ON cultures(status);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS culture_id UUID;

DO $$ BEGIN
  ALTER TABLE products
    ADD CONSTRAINT fk_products_culture
    FOREIGN KEY (culture_id) REFERENCES cultures(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_culture_id ON products(culture_id);

ALTER TABLE plots
  ALTER COLUMN code DROP NOT NULL;

ALTER TABLE plots
  ALTER COLUMN surface_ha DROP NOT NULL;

ALTER TABLE plots
  ADD COLUMN IF NOT EXISTS culture_id UUID;

ALTER TABLE plots
  ADD COLUMN IF NOT EXISTS product_id UUID;

ALTER TABLE plots
  ADD COLUMN IF NOT EXISTS variety_id UUID;

DO $$ BEGIN
  ALTER TABLE plots
    ADD CONSTRAINT fk_plots_culture
    FOREIGN KEY (culture_id) REFERENCES cultures(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE plots
    ADD CONSTRAINT fk_plots_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE plots
    ADD CONSTRAINT fk_plots_variety
    FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_plots_culture_id ON plots(culture_id);
CREATE INDEX IF NOT EXISTS idx_plots_product_id ON plots(product_id);
CREATE INDEX IF NOT EXISTS idx_plots_variety_id ON plots(variety_id);

INSERT INTO cultures (name, code, description)
VALUES
  ('Fruits rouges', 'FRUITS_ROUGES', 'Fraises, myrtilles, framboises, mûres'),
  ('Agrumes', 'AGRUMES', 'Oranges, mandarines, citrons'),
  ('Fruits à noyau', 'FRUITS_NOYAU', 'Pêches, nectarines, abricots, prunes')
ON CONFLICT (code) DO NOTHING;

COMMIT;