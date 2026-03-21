-- ============================================
-- Welcome Note - Schema Changes
-- ============================================

-- Add welcome note fields to store_config
ALTER TABLE store_config
  ADD COLUMN welcome_title VARCHAR(200),
  ADD COLUMN welcome_message TEXT;

-- Welcome images table
CREATE TABLE welcome_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE welcome_images ENABLE ROW LEVEL SECURITY;

-- Public read, authenticated write
CREATE POLICY "Public read welcome_images" ON welcome_images
  FOR SELECT USING (true);
CREATE POLICY "Auth insert welcome_images" ON welcome_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update welcome_images" ON welcome_images
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete welcome_images" ON welcome_images
  FOR DELETE USING (auth.role() = 'authenticated');
