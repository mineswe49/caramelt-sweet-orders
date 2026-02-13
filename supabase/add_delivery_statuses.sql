-- ============================================================================
-- Migration: Add Delivery Statuses to order_status Enum
-- ============================================================================

-- Add new delivery statuses to order_status enum
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'DELIVERED';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'NOT_DELIVERED';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'RETURNED';

-- Verify all enum values exist
SELECT enum_range(NULL::order_status);
