-- ============================================================================
-- Migration: Add Customers Table and Normalize Orders
-- ============================================================================
-- This migration:
-- 1. Creates a customers table with email/phone as natural keys
-- 2. Adds user_id FK to orders
-- 3. Removes redundant customer data from orders
-- 4. Sets up RLS policies for customers
-- ============================================================================

-- ============================================================================
-- 1. CREATE CUSTOMERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    whatsapp text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Natural key: email + phone uniquely identifies a customer
    UNIQUE(email, phone)
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email_phone ON customers(email, phone);

COMMENT ON TABLE customers IS 'Customer profiles identified by email + phone combination';
COMMENT ON COLUMN customers.email IS 'Customer email address (part of unique key)';
COMMENT ON COLUMN customers.phone IS 'Customer phone number (part of unique key)';
COMMENT ON COLUMN customers.whatsapp IS 'Optional WhatsApp number for order updates';

-- ============================================================================
-- 2. ALTER ORDERS TABLE - Add user_id column
-- ============================================================================

ALTER TABLE orders
ADD COLUMN user_id uuid REFERENCES customers(id) ON DELETE RESTRICT;

-- ============================================================================
-- 3. MIGRATE EXISTING DATA
-- ============================================================================

-- For existing orders, create customers from order data
INSERT INTO customers (id, full_name, email, phone, whatsapp, created_at)
SELECT DISTINCT
    gen_random_uuid(),
    full_name,
    email,
    phone,
    whatsapp,
    created_at
FROM orders
ON CONFLICT (email, phone) DO NOTHING;

-- Link existing orders to their customers
UPDATE orders o
SET user_id = c.id
FROM customers c
WHERE o.email = c.email
  AND o.phone = c.phone
  AND o.user_id IS NULL;

-- ============================================================================
-- 4. MAKE user_id NOT NULL after migration
-- ============================================================================

ALTER TABLE orders
ALTER COLUMN user_id SET NOT NULL;

-- ============================================================================
-- 5. CREATE INDEX on orders user_id for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- ============================================================================
-- 6. DROP REDUNDANT COLUMNS FROM ORDERS
-- ============================================================================

ALTER TABLE orders
DROP COLUMN full_name,
DROP COLUMN email,
DROP COLUMN phone,
DROP COLUMN whatsapp;

-- Update orders table comments
COMMENT ON TABLE orders IS 'Customer orders with fulfillment details (customer info in customers table)';
COMMENT ON COLUMN orders.user_id IS 'Foreign key to customers table';

-- ============================================================================
-- 7. UPDATE ORDERS RLS POLICIES
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can read orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users full access to orders" ON orders;

-- New policies for normalized orders table
CREATE POLICY "Public can create orders"
    ON orders FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Public can read orders"
    ON orders FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Authenticated users full access to orders"
    ON orders FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- ============================================================================
-- 8. ENABLE RLS ON CUSTOMERS TABLE
-- ============================================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Customers RLS Policies
CREATE POLICY "Public can create customers"
    ON customers FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Public can read customers"
    ON customers FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Authenticated users full access to customers"
    ON customers FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
DECLARE
    customer_count int;
    order_count int;
BEGIN
    SELECT COUNT(*) INTO customer_count FROM customers;
    SELECT COUNT(*) INTO order_count FROM orders;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration: Customers Table Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Customers: %', customer_count;
    RAISE NOTICE 'Orders with user_id: %', order_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;
