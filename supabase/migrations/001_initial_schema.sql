-- ============================================
-- El Garaje de Vale - Initial Schema
-- ============================================

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  category VARCHAR(50) NOT NULL,
  item_condition VARCHAR(20) NOT NULL CHECK (item_condition IN ('new', 'like_new', 'used')),
  sale_status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (sale_status IN ('available', 'sold')),
  delivery_method VARCHAR(20) CHECK (delivery_method IN ('delivery', 'pickup', 'both')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON products (category);
CREATE INDEX idx_products_sale_status ON products (sale_status);
CREATE INDEX idx_products_price ON products (price);

-- Product images table
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);

-- Store config table (singleton)
CREATE TABLE store_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name VARCHAR(100) NOT NULL DEFAULT 'El Garaje de Vale',
  whatsapp_number VARCHAR(20) NOT NULL DEFAULT '',
  bank_name VARCHAR(100),
  bank_account_holder VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_account_type VARCHAR(20) CHECK (bank_account_type IN ('savings', 'checking')),
  delivery_method VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (delivery_method IN ('delivery', 'pickup', 'both')),
  pickup_address TEXT,
  pickup_map_url TEXT,
  whatsapp_message_general TEXT DEFAULT 'Hola, vi el catálogo de El Garaje de Vale y estoy interesado/a',
  whatsapp_message_product TEXT DEFAULT 'Hola, me interesa el producto: {nombre} (${precio})',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default config
INSERT INTO store_config (id) VALUES (1);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER store_config_updated_at
  BEFORE UPDATE ON store_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;

-- Products: public read, authenticated write
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);
CREATE POLICY "Auth insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Product images: public read, authenticated write
CREATE POLICY "Public read product_images" ON product_images
  FOR SELECT USING (true);
CREATE POLICY "Auth insert product_images" ON product_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update product_images" ON product_images
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete product_images" ON product_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- Store config: public read, authenticated write
CREATE POLICY "Public read store_config" ON store_config
  FOR SELECT USING (true);
CREATE POLICY "Auth update store_config" ON store_config
  FOR UPDATE USING (auth.role() = 'authenticated');
