BEGIN;

CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_user_scopes_user_id ON user_scopes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_scopes_entity ON user_scopes(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_companies_group_id ON companies(group_id);
CREATE INDEX IF NOT EXISTS idx_companies_parent_id ON companies(parent_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

CREATE INDEX IF NOT EXISTS idx_farms_company_id ON farms(company_id);
CREATE INDEX IF NOT EXISTS idx_farms_category ON farms(category);
CREATE INDEX IF NOT EXISTS idx_farms_status ON farms(status);

CREATE INDEX IF NOT EXISTS idx_plots_farm_id ON plots(farm_id);
CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status);

CREATE INDEX IF NOT EXISTS idx_factories_company_id ON factories(company_id);
CREATE INDEX IF NOT EXISTS idx_factories_status ON factories(status);

CREATE INDEX IF NOT EXISTS idx_stations_company_id ON stations(company_id);
CREATE INDEX IF NOT EXISTS idx_stations_factory_id ON stations(factory_id);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_product_varieties_product_id ON product_varieties(product_id);

CREATE INDEX IF NOT EXISTS idx_agricultural_projects_farm_id ON agricultural_projects(farm_id);
CREATE INDEX IF NOT EXISTS idx_agricultural_projects_plot_id ON agricultural_projects(plot_id);
CREATE INDEX IF NOT EXISTS idx_agricultural_projects_product_id ON agricultural_projects(product_id);
CREATE INDEX IF NOT EXISTS idx_agricultural_projects_status ON agricultural_projects(status);

CREATE INDEX IF NOT EXISTS idx_plantations_project_id ON plantations(project_id);
CREATE INDEX IF NOT EXISTS idx_plantations_plot_id ON plantations(plot_id);
CREATE INDEX IF NOT EXISTS idx_plantations_planting_date ON plantations(planting_date);

CREATE INDEX IF NOT EXISTS idx_treatments_project_id ON treatments(project_id);
CREATE INDEX IF NOT EXISTS idx_treatments_plot_id ON treatments(plot_id);
CREATE INDEX IF NOT EXISTS idx_treatments_date ON treatments(treatment_date);

CREATE INDEX IF NOT EXISTS idx_harvests_project_id ON harvests(project_id);
CREATE INDEX IF NOT EXISTS idx_harvests_farm_id ON harvests(farm_id);
CREATE INDEX IF NOT EXISTS idx_harvests_date ON harvests(harvest_date);

CREATE INDEX IF NOT EXISTS idx_productions_farm_id ON productions(farm_id);
CREATE INDEX IF NOT EXISTS idx_productions_project_id ON productions(project_id);
CREATE INDEX IF NOT EXISTS idx_productions_product_id ON productions(product_id);
CREATE INDEX IF NOT EXISTS idx_productions_date ON productions(production_date);

CREATE INDEX IF NOT EXISTS idx_charges_company_id ON charges(company_id);
CREATE INDEX IF NOT EXISTS idx_charges_farm_id ON charges(farm_id);
CREATE INDEX IF NOT EXISTS idx_charges_project_id ON charges(project_id);
CREATE INDEX IF NOT EXISTS idx_charges_type ON charges(type);
CREATE INDEX IF NOT EXISTS idx_charges_date ON charges(charge_date);

CREATE INDEX IF NOT EXISTS idx_farm_shipments_farm_id ON farm_shipments(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_shipments_factory_id ON farm_shipments(factory_id);
CREATE INDEX IF NOT EXISTS idx_farm_shipments_status ON farm_shipments(status);
CREATE INDEX IF NOT EXISTS idx_farm_shipments_sent_at ON farm_shipments(sent_at);

CREATE INDEX IF NOT EXISTS idx_farm_shipment_items_shipment_id ON farm_shipment_items(shipment_id);
CREATE INDEX IF NOT EXISTS idx_farm_shipment_items_product_id ON farm_shipment_items(product_id);

CREATE INDEX IF NOT EXISTS idx_factory_receptions_factory_id ON factory_receptions(factory_id);
CREATE INDEX IF NOT EXISTS idx_factory_receptions_status ON factory_receptions(status);
CREATE INDEX IF NOT EXISTS idx_factory_receptions_received_at ON factory_receptions(received_at);

CREATE INDEX IF NOT EXISTS idx_factory_reception_items_reception_id ON factory_reception_items(reception_id);
CREATE INDEX IF NOT EXISTS idx_factory_reception_items_product_id ON factory_reception_items(product_id);

CREATE INDEX IF NOT EXISTS idx_lots_product_id ON lots(product_id);
CREATE INDEX IF NOT EXISTS idx_lots_factory_id ON lots(factory_id);
CREATE INDEX IF NOT EXISTS idx_lots_station_id ON lots(station_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);

CREATE INDEX IF NOT EXISTS idx_conditioning_sessions_factory_id ON conditioning_sessions(factory_id);
CREATE INDEX IF NOT EXISTS idx_conditioning_sessions_status ON conditioning_sessions(status);
CREATE INDEX IF NOT EXISTS idx_conditioning_sessions_date ON conditioning_sessions(conditioning_date);

CREATE INDEX IF NOT EXISTS idx_conditioning_inputs_session_id ON conditioning_inputs(session_id);
CREATE INDEX IF NOT EXISTS idx_conditioning_outputs_session_id ON conditioning_outputs(session_id);
CREATE INDEX IF NOT EXISTS idx_conditioning_outputs_category ON conditioning_outputs(category);

CREATE INDEX IF NOT EXISTS idx_stock_movements_entity ON stock_movements(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_country ON clients(country);

CREATE INDEX IF NOT EXISTS idx_customer_orders_client_id ON customer_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_factory_id ON customer_orders(factory_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status);
CREATE INDEX IF NOT EXISTS idx_customer_orders_order_date ON customer_orders(order_date);

CREATE INDEX IF NOT EXISTS idx_customer_order_items_order_id ON customer_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_order_items_product_id ON customer_order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_exportations_client_id ON exportations(client_id);
CREATE INDEX IF NOT EXISTS idx_exportations_order_id ON exportations(order_id);
CREATE INDEX IF NOT EXISTS idx_exportations_status ON exportations(status);

CREATE INDEX IF NOT EXISTS idx_liquidations_exportation_id ON liquidations(exportation_id);
CREATE INDEX IF NOT EXISTS idx_liquidations_status ON liquidations(status);

CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_transports_shipment_id ON transports(shipment_id);
CREATE INDEX IF NOT EXISTS idx_transports_order_id ON transports(order_id);
CREATE INDEX IF NOT EXISTS idx_transports_dates ON transports(departure_date, arrival_date);

CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by_id);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_entity ON tasks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(severity);
CREATE INDEX IF NOT EXISTS idx_issues_entity ON issues(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_alerts_assigned_to ON alerts(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_alerts_level ON alerts(level);
CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON alerts(is_resolved);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

COMMIT;