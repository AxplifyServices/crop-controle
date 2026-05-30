BEGIN;

ALTER TABLE plots
  DROP CONSTRAINT IF EXISTS fk_plots_product;

ALTER TABLE plots
  DROP CONSTRAINT IF EXISTS fk_plots_variety;

DROP INDEX IF EXISTS idx_plots_product_id;
DROP INDEX IF EXISTS idx_plots_variety_id;

ALTER TABLE plots
  DROP COLUMN IF EXISTS product_id;

ALTER TABLE plots
  DROP COLUMN IF EXISTS variety_id;

COMMIT;