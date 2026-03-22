-- ============================================
-- 005: Add pickup_schedule to store_config and products
-- ============================================

-- Global pickup schedule (default empty array)
ALTER TABLE store_config
  ADD COLUMN pickup_schedule JSONB DEFAULT '[]';

-- Per-product pickup schedule (null = inherit from store_config)
ALTER TABLE products
  ADD COLUMN pickup_schedule JSONB;
