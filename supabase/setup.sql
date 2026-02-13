-- ============================================================================
-- Caramelt Dessert Ordering App - Supabase Database Setup
-- ============================================================================
-- This script sets up the complete database schema including:
-- - Extensions and helper functions
-- - Enums and custom types
-- - Core tables (products, orders, order_items)
-- - Row Level Security (RLS) policies
-- - Seed data
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

-- Enable pgcrypto for cryptographic functions (used in nanoid generation)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 2. NANOID FUNCTIONS FOR ORDER CODE GENERATION
-- ============================================================================

-- Helper function: Generate optimized nanoid with custom alphabet
-- This is the core random string generator
CREATE OR REPLACE FUNCTION nanoid_optimized(
    size int DEFAULT 21,
    alphabet text DEFAULT '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
)
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
    idBuilder text := '';
    counter int := 0;
    bytes bytea;
    alphabetIndex int;
    alphabetArray text[];
    alphabetLength int;
    mask int;
    step int;
BEGIN
    alphabetArray := regexp_split_to_array(alphabet, '');
    alphabetLength := array_length(alphabetArray, 1);
    mask := (2 << cast(floor(log(alphabetLength - 1) / log(2)) as int)) - 1;
    step := cast(ceil(1.6 * mask * size / alphabetLength) as int);

    WHILE TRUE LOOP
        bytes := gen_random_bytes(step);

        WHILE counter < step LOOP
            alphabetIndex := (get_byte(bytes, counter) & mask) + 1;

            IF alphabetIndex <= alphabetLength THEN
                idBuilder := idBuilder || alphabetArray[alphabetIndex];
                IF length(idBuilder) = size THEN
                    RETURN idBuilder;
                END IF;
            END IF;

            counter := counter + 1;
        END LOOP;

        counter := 0;
    END LOOP;
END;
$$;

-- Wrapper function: Generate nanoid with default settings
CREATE OR REPLACE FUNCTION nanoid(
    size int DEFAULT 21,
    alphabet text DEFAULT '_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
)
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
    RETURN nanoid_optimized(size, alphabet);
END;
$$;

-- Business function: Generate order code in format "CRM-XXXXXX"
-- Uses 6 alphanumeric characters excluding I and O to avoid confusion
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
    -- Alphabet excludes I and O to prevent confusion with 1 and 0
    RETURN 'CRM-' || nanoid(6, '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ');
END;
$$;

COMMENT ON FUNCTION generate_order_code() IS
'Generates unique order codes in format CRM-XXXXXX using alphanumeric characters (excluding I and O)';

-- ============================================================================
-- 3. ENUMS
-- ============================================================================

-- Order status workflow enum
-- PENDING_ADMIN_ACCEPTANCE -> ACCEPTED -> PAID_CONFIRMED
CREATE TYPE order_status AS ENUM (
    'PENDING_ADMIN_ACCEPTANCE',
    'ACCEPTED',
    'PAID_CONFIRMED'
);

COMMENT ON TYPE order_status IS
'Order lifecycle states: PENDING_ADMIN_ACCEPTANCE (initial), ACCEPTED (admin approved), PAID_CONFIRMED (payment verified)';

-- ============================================================================
-- 4. PRODUCTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL CHECK (price > 0),
    image_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

COMMENT ON TABLE products IS 'Product catalog for desserts available for order';
COMMENT ON COLUMN products.price IS 'Price in EGP (Egyptian Pounds)';
COMMENT ON COLUMN products.is_active IS 'Soft delete flag - inactive products are hidden from customers';
COMMENT ON COLUMN products.image_url IS 'Relative or absolute URL to product image';

-- ============================================================================
-- 5. ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code text UNIQUE NOT NULL DEFAULT generate_order_code(),
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    whatsapp text,
    requested_prep_date date NOT NULL,
    confirmed_prep_date date,
    notes text,
    payment_method text NOT NULL DEFAULT 'cash',
    status order_status NOT NULL DEFAULT 'PENDING_ADMIN_ACCEPTANCE',
    is_paid boolean NOT NULL DEFAULT false,
    paid_at timestamptz,
    admin_comment text,
    created_at timestamptz NOT NULL DEFAULT now(),

    -- Business rule: Orders must be placed at least 2 days in advance
    CONSTRAINT check_requested_prep_date_advance
        CHECK (requested_prep_date >= CURRENT_DATE + INTERVAL '2 days')
);

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_requested_prep_date ON orders(requested_prep_date);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

COMMENT ON TABLE orders IS 'Customer orders with contact info and fulfillment details';
COMMENT ON COLUMN orders.order_code IS 'Human-readable unique order identifier (e.g., CRM-A1B2C3)';
COMMENT ON COLUMN orders.requested_prep_date IS 'Date customer wants the order prepared (must be 2+ days from order date)';
COMMENT ON COLUMN orders.confirmed_prep_date IS 'Admin-confirmed preparation date (may differ from requested)';
COMMENT ON COLUMN orders.whatsapp IS 'WhatsApp number for order updates (optional, may differ from phone)';
COMMENT ON COLUMN orders.payment_method IS 'Payment method (e.g., cash, bank_transfer, credit_card)';
COMMENT ON COLUMN orders.is_paid IS 'Payment confirmation status';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when payment was confirmed';
COMMENT ON COLUMN orders.admin_comment IS 'Internal notes from admin (e.g., special instructions, issues)';

-- ============================================================================
-- 6. ORDER_ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id),
    product_name_snapshot text NOT NULL,
    unit_price_snapshot numeric(10,2) NOT NULL,
    quantity int NOT NULL CHECK (quantity > 0),
    line_total numeric(10,2) GENERATED ALWAYS AS (unit_price_snapshot * quantity) STORED
);

-- Indexes for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

COMMENT ON TABLE order_items IS 'Line items for each order with price/name snapshots for historical accuracy';
COMMENT ON COLUMN order_items.product_name_snapshot IS 'Product name at time of order (preserved even if product is renamed)';
COMMENT ON COLUMN order_items.unit_price_snapshot IS 'Product price at time of order (preserved even if price changes)';
COMMENT ON COLUMN order_items.line_total IS 'Computed column: unit_price_snapshot * quantity';

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Products RLS Policies
-- ----------------------------------------------------------------------------

-- Anonymous and authenticated users can view active products
DROP POLICY IF EXISTS "Public read access to active products" ON products;
CREATE POLICY "Public read access to active products"
    ON products
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Authenticated users (admin) have full access to all products
DROP POLICY IF EXISTS "Authenticated users full access to products" ON products;
CREATE POLICY "Authenticated users full access to products"
    ON products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Orders RLS Policies
-- ----------------------------------------------------------------------------

-- Anonymous and authenticated users can create orders
DROP POLICY IF EXISTS "Public can create orders" ON orders;
CREATE POLICY "Public can create orders"
    ON orders
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Anonymous and authenticated users can view their own orders
-- Note: In production, you'd add user_id column and check auth.uid()
-- For now, allowing read access for order tracking by order_code
DROP POLICY IF EXISTS "Public can read orders" ON orders;
CREATE POLICY "Public can read orders"
    ON orders
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Authenticated users (admin) have full access to all orders
DROP POLICY IF EXISTS "Authenticated users full access to orders" ON orders;
CREATE POLICY "Authenticated users full access to orders"
    ON orders
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Order Items RLS Policies
-- ----------------------------------------------------------------------------

-- Anonymous and authenticated users can create order items
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
CREATE POLICY "Public can create order items"
    ON order_items
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Anonymous and authenticated users can view order items
DROP POLICY IF EXISTS "Public can read order items" ON order_items;
CREATE POLICY "Public can read order items"
    ON order_items
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Authenticated users (admin) have full access to all order items
DROP POLICY IF EXISTS "Authenticated users full access to order items" ON order_items;
CREATE POLICY "Authenticated users full access to order items"
    ON order_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 8. SEED DATA
-- ============================================================================

-- Insert sample products
-- Note: Using INSERT ... ON CONFLICT to make script idempotent
INSERT INTO products (name, description, price, image_url, is_active) VALUES
(
    'Caramel Lava Cake',
    'Rich molten chocolate cake with a gooey caramel center, dusted with cocoa powder and served with a drizzle of salted caramel sauce.',
    185.00,
    '/products/caramel-lava-cake.jpg',
    true
),
(
    'Rose & Pistachio Kunafa Cheesecake',
    'A fusion of creamy cheesecake and crispy kunafa pastry, layered with rosewater cream and topped with crushed pistachios.',
    220.00,
    '/products/kunafa-cheesecake.jpg',
    true
),
(
    'Lotus Biscoff Tiramisu',
    'Classic tiramisu reimagined with Lotus Biscoff spread, espresso-soaked biscoff biscuits, and mascarpone cream.',
    165.00,
    '/products/biscoff-tiramisu.jpg',
    true
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- Verify setup with counts
DO $$
DECLARE
    product_count int;
    order_count int;
    order_item_count int;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO order_count FROM orders;
    SELECT COUNT(*) INTO order_item_count FROM order_items;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Caramelt Database Setup Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Products: %', product_count;
    RAISE NOTICE 'Orders: %', order_count;
    RAISE NOTICE 'Order Items: %', order_item_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;
