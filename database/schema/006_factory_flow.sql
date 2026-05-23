BEGIN;

CREATE TABLE IF NOT EXISTS farm_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_number VARCHAR(80) NOT NULL UNIQUE,
    farm_id UUID NOT NULL,
    project_id UUID,
    factory_id UUID NOT NULL,
    status shipment_status_enum NOT NULL DEFAULT 'DRAFT',
    planned_date TIMESTAMP,
    sent_at TIMESTAMP,
    transport_mode VARCHAR(100),
    transporter_name VARCHAR(150),
    driver_name VARCHAR(150),
    vehicle_plate VARCHAR(50),
    observations TEXT,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_farm_shipments_farm
        FOREIGN KEY (farm_id) REFERENCES farms(id),
    CONSTRAINT fk_farm_shipments_project
        FOREIGN KEY (project_id) REFERENCES agricultural_projects(id) ON DELETE SET NULL,
    CONSTRAINT fk_farm_shipments_factory
        FOREIGN KEY (factory_id) REFERENCES factories(id),
    CONSTRAINT fk_farm_shipments_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS farm_shipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variety_id UUID,
    lot_number VARCHAR(100),
    declared_qty_kg DECIMAL(14,3) NOT NULL,
    quality_grade quality_grade_enum,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_farm_shipment_items_shipment
        FOREIGN KEY (shipment_id) REFERENCES farm_shipments(id) ON DELETE CASCADE,
    CONSTRAINT fk_farm_shipment_items_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_farm_shipment_items_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT chk_farm_shipment_items_qty
        CHECK (declared_qty_kg >= 0)
);

CREATE TABLE IF NOT EXISTS factory_receptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reception_number VARCHAR(80) NOT NULL UNIQUE,
    shipment_id UUID NOT NULL UNIQUE,
    factory_id UUID NOT NULL,
    status reception_status_enum NOT NULL DEFAULT 'PENDING',
    received_at TIMESTAMP,
    receiver_id UUID,
    observations TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_factory_receptions_shipment
        FOREIGN KEY (shipment_id) REFERENCES farm_shipments(id) ON DELETE CASCADE,
    CONSTRAINT fk_factory_receptions_factory
        FOREIGN KEY (factory_id) REFERENCES factories(id),
    CONSTRAINT fk_factory_receptions_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS factory_reception_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reception_id UUID NOT NULL,
    shipment_item_id UUID,
    product_id UUID NOT NULL,
    variety_id UUID,
    lot_number VARCHAR(100),
    declared_qty_kg DECIMAL(14,3) NOT NULL,
    received_qty_kg DECIMAL(14,3) NOT NULL,
    discrepancy_kg DECIMAL(14,3) GENERATED ALWAYS AS (received_qty_kg - declared_qty_kg) STORED,
    quality_grade quality_grade_enum,
    rejection_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_factory_reception_items_reception
        FOREIGN KEY (reception_id) REFERENCES factory_receptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_factory_reception_items_shipment_item
        FOREIGN KEY (shipment_item_id) REFERENCES farm_shipment_items(id) ON DELETE SET NULL,
    CONSTRAINT fk_factory_reception_items_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_factory_reception_items_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT chk_factory_reception_items_declared
        CHECK (declared_qty_kg >= 0),
    CONSTRAINT chk_factory_reception_items_received
        CHECK (received_qty_kg >= 0)
);

CREATE TABLE IF NOT EXISTS lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_number VARCHAR(100) NOT NULL UNIQUE,
    reception_item_id UUID,
    harvest_id UUID,
    factory_id UUID,
    station_id UUID,
    product_id UUID NOT NULL,
    variety_id UUID,
    weight_kg DECIMAL(14,3) NOT NULL,
    quality_grade quality_grade_enum DEFAULT 'A',
    status lot_status_enum NOT NULL DEFAULT 'IN_PROGRESS',
    agricultural_cost_kg DECIMAL(14,4),
    factory_cost_kg DECIMAL(14,4),
    transport_cost_kg DECIMAL(14,4),
    margin_kg DECIMAL(14,4),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lots_reception_item
        FOREIGN KEY (reception_item_id) REFERENCES factory_reception_items(id) ON DELETE SET NULL,
    CONSTRAINT fk_lots_harvest
        FOREIGN KEY (harvest_id) REFERENCES harvests(id) ON DELETE SET NULL,
    CONSTRAINT fk_lots_factory
        FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE SET NULL,
    CONSTRAINT fk_lots_station
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL,
    CONSTRAINT fk_lots_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_lots_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT chk_lots_weight
        CHECK (weight_kg >= 0)
);

CREATE TABLE IF NOT EXISTS conditioning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_number VARCHAR(80) NOT NULL UNIQUE,
    factory_id UUID NOT NULL,
    station_id UUID,
    status conditioning_status_enum NOT NULL DEFAULT 'DRAFT',
    conditioning_date DATE NOT NULL,
    responsible_id UUID,
    labor_cost DECIMAL(14,2),
    packaging_cost DECIMAL(14,2),
    other_cost DECIMAL(14,2),
    total_cost DECIMAL(14,2),
    currency VARCHAR(10) NOT NULL DEFAULT 'MAD',
    observations TEXT,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conditioning_sessions_factory
        FOREIGN KEY (factory_id) REFERENCES factories(id),
    CONSTRAINT fk_conditioning_sessions_station
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL,
    CONSTRAINT fk_conditioning_sessions_responsible
        FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_conditioning_sessions_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS conditioning_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    lot_id UUID,
    product_id UUID NOT NULL,
    variety_id UUID,
    lot_number VARCHAR(100),
    input_qty_kg DECIMAL(14,3) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conditioning_inputs_session
        FOREIGN KEY (session_id) REFERENCES conditioning_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_conditioning_inputs_lot
        FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE SET NULL,
    CONSTRAINT fk_conditioning_inputs_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_conditioning_inputs_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT chk_conditioning_inputs_qty
        CHECK (input_qty_kg >= 0)
);

CREATE TABLE IF NOT EXISTS conditioning_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    product_id UUID NOT NULL,
    variety_id UUID,
    category output_category_enum NOT NULL,
    output_qty_kg DECIMAL(14,3) NOT NULL,
    estimated_unit_cost DECIMAL(14,4),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conditioning_outputs_session
        FOREIGN KEY (session_id) REFERENCES conditioning_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_conditioning_outputs_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_conditioning_outputs_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT chk_conditioning_outputs_qty
        CHECK (output_qty_kg >= 0)
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_type stock_movement_type_enum NOT NULL,
    entity_type entity_type_enum NOT NULL,
    entity_id UUID NOT NULL,
    factory_id UUID,
    station_id UUID,
    product_id UUID NOT NULL,
    variety_id UUID,
    lot_id UUID,
    quantity_kg DECIMAL(14,3) NOT NULL,
    movement_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_movements_factory
        FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE SET NULL,
    CONSTRAINT fk_stock_movements_station
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL,
    CONSTRAINT fk_stock_movements_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_stock_movements_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT fk_stock_movements_lot
        FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE SET NULL,
    CONSTRAINT fk_stock_movements_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_stock_movements_qty
        CHECK (quantity_kg >= 0)
);

COMMIT;