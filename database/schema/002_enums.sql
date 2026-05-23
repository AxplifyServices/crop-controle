BEGIN;

DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE company_status_enum AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE farm_category_enum AS ENUM ('OWNED', 'TPG', 'THIRD_PARTY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE permission_action_enum AS ENUM ('VIEW', 'CREATE', 'UPDATE', 'DELETE', 'VALIDATE', 'EXPORT', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_type_enum AS ENUM (
        'GROUP',
        'COMPANY',
        'FARM',
        'PLOT',
        'AGRICULTURAL_PROJECT',
        'FACTORY',
        'STATION',
        'PRODUCT',
        'CLIENT',
        'ORDER',
        'INVOICE',
        'DASHBOARD',
        'SHIPMENT',
        'RECEPTION',
        'CONDITIONING_SESSION',
        'LOT',
        'EXPORTATION',
        'LIQUIDATION',
        'TRANSPORT',
        'TASK',
        'ISSUE',
        'ALERT'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status_enum AS ENUM ('PREPARATION', 'IN_PRODUCTION', 'FINISHED', 'SUSPENDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE culture_type_enum AS ENUM ('FRAISE', 'MYRTILLE', 'FRAMBOISE', 'MURE', 'MIXTE', 'AUTRE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE plot_status_enum AS ENUM ('PRODUCTION', 'JEUNE', 'REPOS', 'EN_FRICHE', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE plantation_category_enum AS ENUM ('ANNUAL', 'MULTI_YEAR', 'RENEWAL', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE charge_type_enum AS ENUM (
        'WATER',
        'FERTILIZER',
        'SEEDS',
        'PLANTS',
        'PHYTOSANITARY',
        'LABOR',
        'ENERGY',
        'MATERIAL',
        'PACKAGING',
        'INTERNAL_TRANSPORT',
        'MAINTENANCE',
        'RENT',
        'LOGISTICS',
        'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE shipment_status_enum AS ENUM (
        'DRAFT',
        'READY_TO_SEND',
        'SENT',
        'PARTIALLY_RECEIVED',
        'FULLY_RECEIVED',
        'DISCREPANCY',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE reception_status_enum AS ENUM (
        'PENDING',
        'IN_PROGRESS',
        'VALIDATED',
        'DISCREPANCY_TO_JUSTIFY',
        'PARTIALLY_REJECTED',
        'FULLY_REJECTED',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE quality_grade_enum AS ENUM ('A', 'B', 'C', 'PREMIUM', 'STANDARD', 'DOWNGRADED', 'REFUSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE lot_status_enum AS ENUM ('IN_PROGRESS', 'AVAILABLE', 'RESERVED', 'SHIPPED', 'LIQUIDATED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE conditioning_status_enum AS ENUM ('DRAFT', 'IN_PROGRESS', 'VALIDATED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE output_category_enum AS ENUM (
        'EXPORT',
        'LOCAL_MARKET',
        'FROZEN',
        'LOSS',
        'PREMIUM',
        'STANDARD',
        'DOWNGRADED',
        'WASTE',
        'TRANSFORMATION'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE stock_movement_type_enum AS ENUM ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'LOSS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM (
        'DRAFT',
        'PREPARED',
        'SHIPPED',
        'RECEIVED_BY_CLIENT',
        'QUALITY_RETURN_RECEIVED',
        'INVOICED',
        'PARTIALLY_PAID',
        'FULLY_PAID',
        'CLOSED',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE exportation_status_enum AS ENUM ('DRAFT', 'SENT', 'RECEIVED', 'LIQUIDATED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE liquidation_status_enum AS ENUM ('PENDING', 'CALCULATED', 'VALIDATED', 'INVOICED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status_enum AS ENUM (
        'DRAFT',
        'GENERATED',
        'SENT',
        'PARTIALLY_PAID',
        'PAID',
        'OVERDUE',
        'DISPUTED',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'LATE', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('BANK_TRANSFER', 'CHECK', 'CASH', 'CARD', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_type_enum AS ENUM ('REFRIGERATED', 'UTILITY', 'AGRICULTURAL', 'FUNCTION_CAR', 'TRUCK', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type_enum AS ENUM (
        'CHARGE_PROOF',
        'SHIPMENT_NOTE',
        'RECEPTION_NOTE',
        'QUALITY_PHOTO',
        'TRANSPORT_DOCUMENT',
        'CONDITIONING_REPORT',
        'DELIVERY_NOTE',
        'CLIENT_RETURN',
        'INVOICE_PDF',
        'PAYMENT_PROOF',
        'CONTRACT',
        'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status_enum AS ENUM ('NEW', 'OPEN', 'IN_PROGRESS', 'POSTPONED', 'CLOSED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_status_enum AS ENUM ('NEW', 'OPEN', 'IN_PROGRESS', 'POSTPONED', 'CLOSED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_severity_enum AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_level_enum AS ENUM ('INFO', 'WARNING', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_status_enum AS ENUM ('UNREAD', 'READ', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;