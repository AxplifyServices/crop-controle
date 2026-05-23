BEGIN;

CREATE TABLE IF NOT EXISTS transports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(100) UNIQUE,
    from_type entity_type_enum NOT NULL,
    from_entity_id UUID NOT NULL,
    to_type entity_type_enum NOT NULL,
    to_entity_id UUID NOT NULL,
    shipment_id UUID,
    order_id UUID,
    vehicle_id UUID,
    transporter_name VARCHAR(150),
    driver_name VARCHAR(150),
    vehicle_plate VARCHAR(50),
    departure_date TIMESTAMP,
    arrival_date TIMESTAMP,
    cost DECIMAL(14,2),
    currency VARCHAR(10) NOT NULL DEFAULT 'MAD',
    temperature DECIMAL(6,2),
    observations TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transports_shipment
        FOREIGN KEY (shipment_id) REFERENCES farm_shipments(id) ON DELETE SET NULL,
    CONSTRAINT fk_transports_order
        FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_transports_vehicle
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS storage_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factory_id UUID,
    station_id UUID,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    capacity_kg DECIMAL(14,3),
    status entity_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_storage_locations_factory
        FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE SET NULL,
    CONSTRAINT fk_storage_locations_station
        FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type document_type_enum NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(150),
    size_bytes INTEGER,
    entity_type entity_type_enum NOT NULL,
    entity_id UUID NOT NULL,

    charge_id UUID,
    shipment_id UUID,
    reception_id UUID,
    conditioning_session_id UUID,
    order_id UUID,
    quality_return_id UUID,
    invoice_id UUID,
    payment_id UUID,
    transport_id UUID,
    lot_id UUID,
    task_id UUID,
    issue_id UUID,

    uploaded_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_documents_charge
        FOREIGN KEY (charge_id) REFERENCES charges(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_shipment
        FOREIGN KEY (shipment_id) REFERENCES farm_shipments(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_reception
        FOREIGN KEY (reception_id) REFERENCES factory_receptions(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_conditioning_session
        FOREIGN KEY (conditioning_session_id) REFERENCES conditioning_sessions(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_order
        FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_quality_return
        FOREIGN KEY (quality_return_id) REFERENCES quality_returns(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_payment
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_transport
        FOREIGN KEY (transport_id) REFERENCES transports(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_lot
        FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_uploaded_by
        FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_documents_size
        CHECK (size_bytes IS NULL OR size_bytes >= 0)
);

COMMIT;