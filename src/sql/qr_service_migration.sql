-- QR Service Migration — run AFTER base schema.sql

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS business_menus (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  file_type    TEXT NOT NULL CHECK (file_type IN ('pdf','image')),
  storage_path TEXT NOT NULL,
  public_url   TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_business_menus_business_id ON business_menus(business_id);
CREATE TRIGGER update_business_menus_updated_at BEFORE UPDATE ON business_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUTURE-PROOF QR: encode only "/{slug}", never a full URL.
-- If domain changes, the QR PNG never needs to be reprinted.
-- Regenerating overwrites the same Storage path -> same public URL.
ALTER TABLE qr_codes
  ADD COLUMN IF NOT EXISTS encoded_path     TEXT,
  ADD COLUMN IF NOT EXISTS storage_path     TEXT,
  ADD COLUMN IF NOT EXISTS foreground_color TEXT DEFAULT '#0f172a',
  ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff';

ALTER TABLE business_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business members can manage menus"
  ON business_menus FOR ALL
  USING (EXISTS (
    SELECT 1 FROM business_members bm
    WHERE bm.business_id = business_menus.business_id AND bm.user_id = auth.uid()
  ));

CREATE POLICY "Public view active menus of published businesses"
  ON business_menus FOR SELECT
  USING (is_active = true AND EXISTS (
    SELECT 1 FROM businesses b WHERE b.id = business_menus.business_id AND b.is_published = true
  ));

-- Add public read for qr_codes (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='qr_codes'
    AND policyname='Public view QR codes of published businesses') THEN
    EXECUTE $p$
      CREATE POLICY "Public view QR codes of published businesses"
        ON qr_codes FOR SELECT
        USING (is_active=true AND EXISTS(
          SELECT 1 FROM businesses b WHERE b.id=qr_codes.business_id AND b.is_published=true))
    $p$;
  END IF;
END $$;

-- Required Storage buckets (create in Supabase Dashboard -> Storage):
--   "menus"    -> store PDF/image uploads (set to private)
--   "qr-codes" -> store generated QR PNGs (set to public)
--   "logos"    -> business logos (set to public)
