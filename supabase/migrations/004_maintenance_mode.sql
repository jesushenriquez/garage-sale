-- ============================================
-- 004 - Maintenance Mode
-- ============================================

ALTER TABLE store_config
  ADD COLUMN maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN maintenance_message TEXT DEFAULT 'Estamos realizando mejoras. Volvemos pronto.';
