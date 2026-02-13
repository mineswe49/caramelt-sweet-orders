-- ============================================================================
-- Migration: Fix order_status enum and verify schema
-- ============================================================================

-- Step 1: Add CANCELLED to order_status enum if not already present
-- (This is safe - it won't fail if it already exists)
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Step 2: Verify orders table has all required columns
-- If any column is missing, it will show in the results

-- Check which columns exist in orders table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Step 3: If email column is missing, add it (uncomment if needed)
-- ALTER TABLE orders ADD COLUMN email text NOT NULL DEFAULT 'unknown@email.com';

-- Step 4: Verify the enum has all values
SELECT enum_range(NULL::order_status);

-- Done! Your database should now be properly configured.
