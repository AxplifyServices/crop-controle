BEGIN;

CREATE TABLE IF NOT EXISTS agricultural_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL,
    plot_id UUID,
    product_id UUID NOT NULL,
    variety_id UUID,
    name VARCHAR(150) NOT NULL,
    season VARCHAR(100),
    plant_count INTEGER NOT NULL DEFAULT 0,
    active_plant_count INTEGER,
    surface_ha DECIMAL(12,2),
    start_date DATE,
    expected_end_date DATE,
    end_date DATE,
    responsible_id UUID,
    status project_status_enum NOT NULL DEFAULT 'PREPARATION',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_agricultural_projects_farm
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    CONSTRAINT fk_agricultural_projects_plot
        FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE SET NULL,
    CONSTRAINT fk_agricultural_projects_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_agricultural_projects_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT fk_agricultural_projects_responsible
        FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_agricultural_projects_plant_count
        CHECK (plant_count >= 0),
    CONSTRAINT chk_agricultural_projects_active_plant_count
        CHECK (active_plant_count IS NULL OR active_plant_count >= 0)
);

CREATE TABLE IF NOT EXISTS plantations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    plot_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variety_id UUID,
    planting_date DATE NOT NULL,
    plant_quantity INTEGER NOT NULL,
    density INTEGER,
    category plantation_category_enum DEFAULT 'OTHER',
    total_cost DECIMAL(14,2),
    currency VARCHAR(10) NOT NULL DEFAULT 'MAD',
    observations TEXT,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plantations_project
        FOREIGN KEY (project_id) REFERENCES agricultural_projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_plantations_plot
        FOREIGN KEY (plot_id) REFERENCES plots(id),
    CONSTRAINT fk_plantations_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_plantations_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT fk_plantations_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_plantations_quantity
        CHECK (plant_quantity >= 0)
);

CREATE TABLE IF NOT EXISTS treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    plot_id UUID NOT NULL,
    treatment_date DATE NOT NULL,
    product_type VARCHAR(100),
    product_name VARCHAR(150),
    dose VARCHAR(100),
    treated_surface_ha DECIMAL(12,2),
    cost DECIMAL(14,2),
    currency VARCHAR(10) NOT NULL DEFAULT 'MAD',
    observations TEXT,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_treatments_project
        FOREIGN KEY (project_id) REFERENCES agricultural_projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_treatments_plot
        FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE,
    CONSTRAINT fk_treatments_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS harvests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    farm_id UUID NOT NULL,
    plot_id UUID,
    product_id UUID NOT NULL,
    variety_id UUID,
    harvest_date DATE NOT NULL,
    weight_total_kg DECIMAL(14,3) NOT NULL,
    team VARCHAR(150),
    quality_grade quality_grade_enum,
    observations TEXT,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_harvests_project
        FOREIGN KEY (project_id) REFERENCES agricultural_projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_harvests_farm
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    CONSTRAINT fk_harvests_plot
        FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE SET NULL,
    CONSTRAINT fk_harvests_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_harvests_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT fk_harvests_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_harvests_weight
        CHECK (weight_total_kg >= 0)
);

CREATE TABLE IF NOT EXISTS productions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    harvest_id UUID,
    farm_id UUID NOT NULL,
    project_id UUID NOT NULL,
    plot_id UUID,
    product_id UUID NOT NULL,
    variety_id UUID,
    production_date DATE NOT NULL,
    quantity_kg DECIMAL(14,3) NOT NULL,
    quality_grade quality_grade_enum,
    active_plant_count INTEGER,
    production_per_plant DECIMAL(14,6),
    source VARCHAR(100),
    observations TEXT,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_productions_harvest
        FOREIGN KEY (harvest_id) REFERENCES harvests(id) ON DELETE SET NULL,
    CONSTRAINT fk_productions_farm
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    CONSTRAINT fk_productions_project
        FOREIGN KEY (project_id) REFERENCES agricultural_projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_productions_plot
        FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE SET NULL,
    CONSTRAINT fk_productions_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_productions_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT fk_productions_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_productions_quantity
        CHECK (quantity_kg >= 0)
);

CREATE TABLE IF NOT EXISTS charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    farm_id UUID NOT NULL,
    project_id UUID,
    plot_id UUID,
    type charge_type_enum NOT NULL,
    label VARCHAR(150) NOT NULL,
    quantity DECIMAL(14,3),
    unit VARCHAR(50),
    unit_cost DECIMAL(14,4),
    total_cost DECIMAL(14,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'MAD',
    supplier VARCHAR(150),
    charge_date DATE NOT NULL,
    description TEXT,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_charges_company
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    CONSTRAINT fk_charges_farm
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
    CONSTRAINT fk_charges_project
        FOREIGN KEY (project_id) REFERENCES agricultural_projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_charges_plot
        FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE SET NULL,
    CONSTRAINT fk_charges_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_charges_total_cost
        CHECK (total_cost >= 0)
);

COMMIT;