ALTER TABLE stations
ADD COLUMN IF NOT EXISTS features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX IF NOT EXISTS idx_stations_features
ON stations USING GIN (features);