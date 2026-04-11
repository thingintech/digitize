-- Storage Buckets Configuration for Thing in Tech
-- Run this in Supabase SQL Editor after running schema.sql

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Create buckets (you can also do this via Supabase Dashboard > Storage)

-- Bucket for business logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'business-logos',
    'business-logos',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for business cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'business-covers',
    'business-covers',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for menu item images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'menu-items',
    'menu-items',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for menu category images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'menu-categories',
    'menu-categories',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for QR code images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'qr-codes',
    'qr-codes',
    true,
    1048576, -- 1MB
    ARRAY['image/png', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for uploaded menu PDFs/images (for processing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'menu-uploads',
    'menu-uploads',
    false, -- private
    20971520, -- 20MB
    ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE RLS POLICIES
-- =====================================================

-- Business Logos
CREATE POLICY "Anyone can view business logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'business-logos');

CREATE POLICY "Business members can upload logos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'business-logos' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Business members can update their logos"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'business-logos'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Business members can delete their logos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'business-logos'
        AND auth.uid() IS NOT NULL
    );

-- Business Cover Images
CREATE POLICY "Anyone can view business covers"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'business-covers');

CREATE POLICY "Business members can upload covers"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'business-covers'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Business members can update their covers"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'business-covers'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Business members can delete their covers"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'business-covers'
        AND auth.uid() IS NOT NULL
    );

-- Menu Item Images
CREATE POLICY "Anyone can view menu item images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'menu-items');

CREATE POLICY "Business members can upload menu item images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'menu-items'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Business members can update menu item images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'menu-items'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Business members can delete menu item images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'menu-items'
        AND auth.uid() IS NOT NULL
    );

-- Menu Category Images
CREATE POLICY "Anyone can view category images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'menu-categories');

CREATE POLICY "Business members can upload category images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'menu-categories'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Business members can update category images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'menu-categories'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Business members can delete category images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'menu-categories'
        AND auth.uid() IS NOT NULL
    );

-- QR Codes
CREATE POLICY "Anyone can view QR codes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'qr-codes');

CREATE POLICY "Business members can upload QR codes"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'qr-codes'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Business members can update QR codes"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'qr-codes'
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Business members can delete QR codes"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'qr-codes'
        AND auth.uid() IS NOT NULL
    );

-- Menu Uploads (Private)
CREATE POLICY "Users can view their own menu uploads"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'menu-uploads'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload their own menu files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'menu-uploads'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own menu uploads"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'menu-uploads'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Avatars
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- HELPER FUNCTIONS FOR STORAGE
-- =====================================================

-- Function to get public URL for an image
CREATE OR REPLACE FUNCTION get_public_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN format(
        'https://%s.supabase.co/storage/v1/object/public/%s/%s',
        current_setting('app.settings.project_ref'),
        bucket_name,
        file_path
    );
END;
$$ LANGUAGE plpgsql;

-- Function to delete old image when updating
CREATE OR REPLACE FUNCTION delete_old_storage_object()
RETURNS TRIGGER AS $$
DECLARE
    old_url TEXT;
    new_url TEXT;
    col_name TEXT;
    bucket_and_path TEXT;
BEGIN
    col_name := TG_ARGV[0];
    
    EXECUTE format('SELECT ($1).%I, ($2).%I', col_name, col_name)
    USING OLD, NEW
    INTO old_url, new_url;

    IF old_url IS NOT NULL AND (new_url IS NULL OR new_url IS DISTINCT FROM old_url) THEN
        bucket_and_path := split_part(old_url, '/storage/v1/object/public/', 2);
        
        IF bucket_and_path IS NOT NULL AND bucket_and_path != '' THEN
            BEGIN
                DELETE FROM storage.objects 
                WHERE bucket_id = split_part(bucket_and_path, '/', 1)
                  AND name = substring(bucket_and_path from (position('/' in bucket_and_path) + 1));
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING '[storage_cleanup] Error: %', SQLERRM;
            END;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to menu_items
CREATE TRIGGER cleanup_menu_item_image
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    WHEN (OLD.image_url IS DISTINCT FROM NEW.image_url)
    EXECUTE FUNCTION delete_old_storage_object('image_url');

-- Apply trigger to businesses (logo)
CREATE TRIGGER cleanup_business_logo
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    WHEN (OLD.logo_url IS DISTINCT FROM NEW.logo_url)
    EXECUTE FUNCTION delete_old_storage_object('logo_url');

-- Apply trigger to businesses (cover)
CREATE TRIGGER cleanup_business_cover
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    WHEN (OLD.cover_image_url IS DISTINCT FROM NEW.cover_image_url)
    EXECUTE FUNCTION delete_old_storage_object('cover_image_url');
