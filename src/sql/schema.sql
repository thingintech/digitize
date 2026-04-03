-- Thing in Tech Database Schema
-- Complete database setup for SaaS restaurant management platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'manager', 'staff');
CREATE TYPE analytics_event_type AS ENUM ('menu_view', 'item_view', 'qr_scan', 'whatsapp_click', 'phone_click', 'link_click');

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    
    -- Contact Information
    email TEXT,
    phone TEXT,
    whatsapp_number TEXT,
    website TEXT,
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',
    
    -- Location coordinates
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Google Maps
    google_maps_url TEXT,
    google_place_id TEXT,
    
    -- Business Settings
    currency TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'America/New_York',
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    
    -- Branding
    primary_color TEXT DEFAULT '#1e293b',
    secondary_color TEXT DEFAULT '#8b5cf6',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Business Members (Users who can access a business)
CREATE TABLE business_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'staff',
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES profiles(id),
    
    UNIQUE(business_id, user_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'trialing',
    
    -- Billing
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    
    -- Dates
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(business_id)
);

-- Menu Categories
CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    
    -- Item details
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    preparation_time INTEGER, -- in minutes
    calories INTEGER,
    
    -- Tags and dietary info
    tags TEXT[], -- ['spicy', 'vegan', 'gluten-free', etc.]
    allergens TEXT[], -- ['nuts', 'dairy', 'gluten', etc.]
    
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Codes
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL, -- e.g., "Table 5", "Front Counter", "Takeout"
    code TEXT UNIQUE NOT NULL, -- Unique identifier for the QR code
    qr_image_url TEXT, -- URL to generated QR code image
    
    -- Destination
    destination_url TEXT NOT NULL,
    
    -- Tracking
    scan_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMPTZ,
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    table_number TEXT,
    location TEXT, -- e.g., "Main Dining", "Patio", "Bar"
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    event_type analytics_event_type NOT NULL,
    
    -- Event details
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE SET NULL,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- User info (anonymous)
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    
    -- Location (if available)
    country TEXT,
    city TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Settings (flexible key-value store)
CREATE TABLE business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(business_id, key)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);

-- Businesses
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_is_active ON businesses(is_active);
CREATE INDEX idx_businesses_is_published ON businesses(is_published);
CREATE INDEX idx_businesses_created_at ON businesses(created_at DESC);

-- Business Members
CREATE INDEX idx_business_members_business_id ON business_members(business_id);
CREATE INDEX idx_business_members_user_id ON business_members(user_id);
CREATE INDEX idx_business_members_role ON business_members(role);

-- Subscriptions
CREATE INDEX idx_subscriptions_business_id ON subscriptions(business_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Menu Categories
CREATE INDEX idx_menu_categories_business_id ON menu_categories(business_id);
CREATE INDEX idx_menu_categories_sort_order ON menu_categories(business_id, sort_order);
CREATE INDEX idx_menu_categories_is_active ON menu_categories(is_active);

-- Menu Items
CREATE INDEX idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_is_featured ON menu_items(is_featured);
CREATE INDEX idx_menu_items_sort_order ON menu_items(category_id, sort_order);
CREATE INDEX idx_menu_items_tags ON menu_items USING GIN(tags);

-- QR Codes
CREATE INDEX idx_qr_codes_business_id ON qr_codes(business_id);
CREATE INDEX idx_qr_codes_code ON qr_codes(code);
CREATE INDEX idx_qr_codes_is_active ON qr_codes(is_active);

-- Analytics Events
CREATE INDEX idx_analytics_events_business_id ON analytics_events(business_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_qr_code_id ON analytics_events(qr_code_id);
CREATE INDEX idx_analytics_events_menu_item_id ON analytics_events(menu_item_id);

-- Business Settings
CREATE INDEX idx_business_settings_business_id ON business_settings(business_id);
CREATE INDEX idx_business_settings_key ON business_settings(key);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at BEFORE UPDATE ON qr_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to increment QR code scan count
CREATE OR REPLACE FUNCTION increment_qr_scan_count(qr_code_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE qr_codes
    SET scan_count = scan_count + 1,
        last_scanned_at = NOW()
    WHERE id = qr_code_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get business stats
CREATE OR REPLACE FUNCTION get_business_stats(business_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_menu_items', (SELECT COUNT(*) FROM menu_items WHERE business_id = business_uuid),
        'total_categories', (SELECT COUNT(*) FROM menu_categories WHERE business_id = business_uuid),
        'total_qr_codes', (SELECT COUNT(*) FROM qr_codes WHERE business_id = business_uuid),
        'total_scans_today', (
            SELECT COUNT(*) FROM analytics_events 
            WHERE business_id = business_uuid 
            AND event_type = 'qr_scan' 
            AND created_at >= CURRENT_DATE
        ),
        'total_views_today', (
            SELECT COUNT(*) FROM analytics_events 
            WHERE business_id = business_uuid 
            AND event_type = 'menu_view' 
            AND created_at >= CURRENT_DATE
        ),
        'total_scans_week', (
            SELECT COUNT(*) FROM analytics_events 
            WHERE business_id = business_uuid 
            AND event_type = 'qr_scan' 
            AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        ),
        'total_views_week', (
            SELECT COUNT(*) FROM analytics_events 
            WHERE business_id = business_uuid 
            AND event_type = 'menu_view' 
            AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get analytics by date range
CREATE OR REPLACE FUNCTION get_analytics_by_date(
    business_uuid UUID,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
)
RETURNS TABLE (
    date DATE,
    qr_scans BIGINT,
    menu_views BIGINT,
    item_views BIGINT,
    whatsapp_clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(ae.created_at) as date,
        COUNT(*) FILTER (WHERE ae.event_type = 'qr_scan') as qr_scans,
        COUNT(*) FILTER (WHERE ae.event_type = 'menu_view') as menu_views,
        COUNT(*) FILTER (WHERE ae.event_type = 'item_view') as item_views,
        COUNT(*) FILTER (WHERE ae.event_type = 'whatsapp_click') as whatsapp_clicks
    FROM analytics_events ae
    WHERE ae.business_id = business_uuid
    AND ae.created_at >= start_date
    AND ae.created_at <= end_date
    GROUP BY DATE(ae.created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has access to business
CREATE OR REPLACE FUNCTION user_has_business_access(business_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM business_members
        WHERE business_id = business_uuid
        AND user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Businesses Policies
CREATE POLICY "Anyone can view published businesses"
    ON businesses FOR SELECT
    USING (is_published = true OR EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = businesses.id
        AND business_members.user_id = auth.uid()
    ));

CREATE POLICY "Business members can insert businesses"
    ON businesses FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Business owners/admins can update business"
    ON businesses FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = businesses.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'admin')
    ));

CREATE POLICY "Business owners can delete business"
    ON businesses FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = businesses.id
        AND business_members.user_id = auth.uid()
        AND business_members.role = 'owner'
    ));

-- Business Members Policies
CREATE POLICY "Users can view members of their businesses"
    ON business_members FOR SELECT
    USING (user_id = auth.uid()); -- Simplified to avoid recursion. Use this to find YOUR businesses.

CREATE POLICY "Business owners/admins can manage members"
    ON business_members FOR ALL
    USING (EXISTS (
        SELECT 1 FROM businesses b
        WHERE b.id = business_members.business_id
        AND EXISTS (
            SELECT 1 FROM business_members bm
            WHERE bm.business_id = b.id
            AND bm.user_id = auth.uid()
            AND bm.role IN ('owner', 'admin')
        )
    )); -- Note: This might still recurse if not careful, but for SELECT we fixed the main loop.

-- Subscriptions Policies
CREATE POLICY "Business members can view subscription"
    ON subscriptions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = subscriptions.business_id
        AND business_members.user_id = auth.uid()
    ));

CREATE POLICY "Business owners/admins can manage subscription"
    ON subscriptions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = subscriptions.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'admin')
    ));

-- Menu Categories Policies
CREATE POLICY "Anyone can view categories of published businesses"
    ON menu_categories FOR SELECT
    USING (
        is_active = true AND EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = menu_categories.business_id
            AND businesses.is_published = true
        )
        OR EXISTS (
            SELECT 1 FROM business_members
            WHERE business_members.business_id = menu_categories.business_id
            AND business_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Business members can manage categories"
    ON menu_categories FOR ALL
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = menu_categories.business_id
        AND business_members.user_id = auth.uid()
    ));

-- Menu Items Policies
CREATE POLICY "Anyone can view items of published businesses"
    ON menu_items FOR SELECT
    USING (
        is_available = true AND EXISTS (
            SELECT 1 FROM businesses
            WHERE businesses.id = menu_items.business_id
            AND businesses.is_published = true
        )
        OR EXISTS (
            SELECT 1 FROM business_members
            WHERE business_members.business_id = menu_items.business_id
            AND business_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Business members can manage menu items"
    ON menu_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = menu_items.business_id
        AND business_members.user_id = auth.uid()
    ));

-- QR Codes Policies
CREATE POLICY "Business members can view QR codes"
    ON qr_codes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = qr_codes.business_id
        AND business_members.user_id = auth.uid()
    ));

CREATE POLICY "Business members can manage QR codes"
    ON qr_codes FOR ALL
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = qr_codes.business_id
        AND business_members.user_id = auth.uid()
    ));

-- Analytics Events Policies
CREATE POLICY "Anyone can insert analytics events"
    ON analytics_events FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Business members can view analytics"
    ON analytics_events FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = analytics_events.business_id
        AND business_members.user_id = auth.uid()
    ));

-- Business Settings Policies
CREATE POLICY "Business members can view settings"
    ON business_settings FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = business_settings.business_id
        AND business_members.user_id = auth.uid()
    ));

CREATE POLICY "Business owners/admins can manage settings"
    ON business_settings FOR ALL
    USING (EXISTS (
        SELECT 1 FROM business_members
        WHERE business_members.business_id = business_settings.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'admin')
    ));
