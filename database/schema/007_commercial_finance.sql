BEGIN;

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    legal_name VARCHAR(200),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    email CITEXT,
    phone VARCHAR(50),
    tax_id VARCHAR(80),
    client_type VARCHAR(80),
    payment_terms TEXT,
    credit_limit DECIMAL(14,2),
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    status entity_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(80) NOT NULL UNIQUE,
    client_id UUID NOT NULL,
    factory_id UUID NOT NULL,
    status order_status_enum NOT NULL DEFAULT 'DRAFT',
    order_date DATE NOT NULL,
    prepared_at TIMESTAMP,
    shipped_at TIMESTAMP,
    client_received_at TIMESTAMP,
    destination_country VARCHAR(100),
    destination_city VARCHAR(100),
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    initial_amount DECIMAL(14,2),
    final_amount DECIMAL(14,2),
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_orders_client
        FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_customer_orders_factory
        FOREIGN KEY (factory_id) REFERENCES factories(id),
    CONSTRAINT fk_customer_orders_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS customer_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    conditioning_output_id UUID,
    product_id UUID NOT NULL,
    variety_id UUID,
    category output_category_enum,
    quantity_sent_kg DECIMAL(14,3) NOT NULL,
    unit_price DECIMAL(14,4) NOT NULL,
    theoretical_amount DECIMAL(14,2) GENERATED ALWAYS AS (quantity_sent_kg * unit_price) STORED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_order_items_order
        FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_customer_order_items_conditioning_output
        FOREIGN KEY (conditioning_output_id) REFERENCES conditioning_outputs(id) ON DELETE SET NULL,
    CONSTRAINT fk_customer_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_customer_order_items_variety
        FOREIGN KEY (variety_id) REFERENCES product_varieties(id) ON DELETE SET NULL,
    CONSTRAINT chk_customer_order_items_qty
        CHECK (quantity_sent_kg >= 0),
    CONSTRAINT chk_customer_order_items_unit_price
        CHECK (unit_price >= 0)
);

CREATE TABLE IF NOT EXISTS quality_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    return_date DATE NOT NULL,
    quantity_sent_kg DECIMAL(14,3) NOT NULL,
    accepted_qty_kg DECIMAL(14,3) NOT NULL,
    rejected_qty_kg DECIMAL(14,3) NOT NULL,
    rejection_reason TEXT,
    comment TEXT,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quality_returns_order
        FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_quality_returns_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_quality_returns_quantities
        CHECK (
            quantity_sent_kg >= 0
            AND accepted_qty_kg >= 0
            AND rejected_qty_kg >= 0
            AND accepted_qty_kg + rejected_qty_kg <= quantity_sent_kg
        )
);

CREATE TABLE IF NOT EXISTS exportations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_number VARCHAR(80) NOT NULL UNIQUE,
    order_id UUID,
    lot_id UUID,
    client_id UUID NOT NULL,
    expedition_date DATE NOT NULL,
    weight_kg DECIMAL(14,3) NOT NULL,
    provisional_price DECIMAL(14,4),
    incoterm VARCHAR(20),
    status exportation_status_enum NOT NULL DEFAULT 'DRAFT',
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exportations_order
        FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_exportations_lot
        FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE SET NULL,
    CONSTRAINT fk_exportations_client
        FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_exportations_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_exportations_weight
        CHECK (weight_kg >= 0)
);

CREATE TABLE IF NOT EXISTS liquidations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exportation_id UUID NOT NULL UNIQUE,
    liquidation_date DATE NOT NULL,
    final_price DECIMAL(14,4) NOT NULL,
    bonus_malus DECIMAL(14,2),
    net_amount DECIMAL(14,2),
    status liquidation_status_enum NOT NULL DEFAULT 'PENDING',
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_liquidations_exportation
        FOREIGN KEY (exportation_id) REFERENCES exportations(id) ON DELETE CASCADE,
    CONSTRAINT fk_liquidations_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(80) NOT NULL UNIQUE,
    order_id UUID UNIQUE,
    liquidation_id UUID UNIQUE,
    client_id UUID NOT NULL,
    status invoice_status_enum NOT NULL DEFAULT 'DRAFT',
    issue_date DATE NOT NULL,
    due_date DATE,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    subtotal DECIMAL(14,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(14,2) DEFAULT 0,
    total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    remaining_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    pdf_url TEXT,
    python_job_id VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_order
        FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_invoices_liquidation
        FOREIGN KEY (liquidation_id) REFERENCES liquidations(id) ON DELETE SET NULL,
    CONSTRAINT fk_invoices_client
        FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT chk_invoices_amounts
        CHECK (
            subtotal >= 0
            AND tax_amount >= 0
            AND total_amount >= 0
            AND paid_amount >= 0
            AND remaining_amount >= 0
        )
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    order_item_id UUID,
    product_id UUID NOT NULL,
    description TEXT,
    category output_category_enum,
    quantity_kg DECIMAL(14,3) NOT NULL,
    unit_price DECIMAL(14,4) NOT NULL,
    amount DECIMAL(14,2) GENERATED ALWAYS AS (quantity_kg * unit_price) STORED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_items_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_items_order_item
        FOREIGN KEY (order_item_id) REFERENCES customer_order_items(id) ON DELETE SET NULL,
    CONSTRAINT fk_invoice_items_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT chk_invoice_items_qty
        CHECK (quantity_kg >= 0),
    CONSTRAINT chk_invoice_items_unit_price
        CHECK (unit_price >= 0)
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    method payment_method_enum DEFAULT 'BANK_TRANSFER',
    reference VARCHAR(150),
    status payment_status_enum NOT NULL DEFAULT 'PAID',
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_created_by
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_payments_amount
        CHECK (amount >= 0)
);

COMMIT;