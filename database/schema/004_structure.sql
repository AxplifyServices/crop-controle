BEGIN;

CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    parent_id UUID,
    name VARCHAR(150) NOT NULL,
    legal_name VARCHAR(200),
    code VARCHAR(50) UNIQUE,
    ice VARCHAR(50),
    tax_id VARCHAR(50),
    rc VARCHAR(50),
    cnss VARCHAR(50),
    patente VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Maroc',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    responsible_id UUID,
    status company_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_companies_group
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_companies_parent
        FOREIGN KEY (parent_id) REFERENCES companies(id) ON DELETE SET NULL,
    CONSTRAINT fk_companies_responsible
        FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE,
    category farm_category_enum NOT NULL DEFAULT 'OWNED',
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    surface_ha DECIMAL(12,2),
    rent_monthly DECIMAL(14,2),
    responsible_id UUID,
    status entity_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_farms_company
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_farms_responsible
        FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150),
    surface_ha DECIMAL(12,2) NOT NULL,
    culture culture_type_enum,
    variety VARCHAR(100),
    status plot_status_enum NOT NULL DEFAULT 'PRODUCTION',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_plots_farm
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS factories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    daily_capacity_kg DECIMAL(14,3),
    responsible_id UUID,
    status entity_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_factories_company
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_factories_responsible
        FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    factory_id UUID,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE,
    daily_capacity_kg DECIMAL(14,3),
    location TEXT,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    status entity_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_stations_company
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    CONSTRAINT fk_stations_factory
        FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE,
    culture culture_type_enum,
    description TEXT,
    default_unit VARCHAR(20) NOT NULL DEFAULT 'KG',
    status entity_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_varieties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    status entity_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_varieties_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uq_product_variety UNIQUE (product_id, name)
);

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    type vehicle_type_enum NOT NULL DEFAULT 'OTHER',
    brand VARCHAR(100),
    model VARCHAR(100),
    registration_number VARCHAR(50) UNIQUE,
    acquisition_mode VARCHAR(50),
    rent_monthly DECIMAL(14,2),
    capacity_kg DECIMAL(14,3),
    status entity_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_vehicles_company
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    company_id UUID,
    farm_id UUID,
    factory_id UUID,
    station_id UUID,
    full_name VARCHAR(150) NOT NULL,
    grade VARCHAR(100),
    contract_type VARCHAR(100),
    salary DECIMAL(14,2),
    status entity_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_personnel_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_personnel_company
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    CONSTRAINT fk_personnel_farm
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL,
    CONSTRAINT fk_personnel_factory
        FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE SET NULL,
    CONSTRAINT fk_personnel_station
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL
);

COMMIT;