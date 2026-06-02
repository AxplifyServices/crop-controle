ALTER TABLE products
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(6);

ALTER TABLE product_varieties
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(6);

ALTER TABLE cultures
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(6);

CREATE INDEX IF NOT EXISTS idx_products_deleted_at
ON products(deleted_at);

CREATE INDEX IF NOT EXISTS idx_product_varieties_deleted_at
ON product_varieties(deleted_at);

CREATE INDEX IF NOT EXISTS idx_cultures_deleted_at
ON cultures(deleted_at);