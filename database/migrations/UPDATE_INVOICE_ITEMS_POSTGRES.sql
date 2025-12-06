-- Update invoice_items table for PostgreSQL
-- This migration updates the existing invoice_items table to support
-- both fixed-price and hourly billing with project/task linking

-- Drop the existing table if it exists (backup data first if needed)
DROP TABLE IF EXISTS invoice_items CASCADE;

-- Create the updated invoice_items table
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    
    -- Fixed price fields
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Hourly billing fields
    hours_worked DECIMAL(10, 2),
    rate_per_hour DECIMAL(10, 2),
    
    -- Calculated amount
    amount DECIMAL(10, 2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_project_id ON invoice_items(project_id);
CREATE INDEX idx_invoice_items_task_id ON invoice_items(task_id);

-- Add comment to table
COMMENT ON TABLE invoice_items IS 'Line items for invoices supporting both fixed-price and hourly billing';

-- Add comments to columns
COMMENT ON COLUMN invoice_items.quantity IS 'Quantity for fixed-price items';
COMMENT ON COLUMN invoice_items.unit_price IS 'Unit price for fixed-price items';
COMMENT ON COLUMN invoice_items.hours_worked IS 'Hours worked for hourly items (NULL for fixed-price)';
COMMENT ON COLUMN invoice_items.rate_per_hour IS 'Hourly rate for hourly items (NULL for fixed-price)';
COMMENT ON COLUMN invoice_items.amount IS 'Calculated total: (quantity * unit_price) OR (hours_worked * rate_per_hour)';

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON invoice_items TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE invoice_items_id_seq TO your_app_user;

-- Verification query
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'invoice_items'
ORDER BY ordinal_position;
