-- 003_footer_config_mejoras.sql
-- Feature 003: Footer y Configuración - Mejoras
-- Adds: document info, contact email, footer contact section, per-product pickup

-- store_config: datos de transferencia
ALTER TABLE store_config ADD COLUMN document_type VARCHAR(20) DEFAULT NULL
  CHECK (document_type IN ('cedula', 'ruc', 'pasaporte'));
ALTER TABLE store_config ADD COLUMN document_number VARCHAR(50) DEFAULT NULL;
ALTER TABLE store_config ADD COLUMN contact_email VARCHAR(150) DEFAULT NULL;

-- store_config: sección de contacto del footer
ALTER TABLE store_config ADD COLUMN footer_contact_text TEXT DEFAULT NULL;
ALTER TABLE store_config ADD COLUMN footer_show_whatsapp BOOLEAN DEFAULT false;

-- products: lugar de recogida personalizado
ALTER TABLE products ADD COLUMN pickup_address TEXT DEFAULT NULL;
ALTER TABLE products ADD COLUMN pickup_map_url TEXT DEFAULT NULL;
