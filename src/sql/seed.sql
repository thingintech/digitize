-- Thing in Tech - Sample Seed Data
-- Run this after schema.sql to populate the database with test data

-- =====================================================
-- SAMPLE BUSINESS DATA
-- =====================================================

-- Note: You'll need to replace the user_id with actual auth.users UUID after signup
-- For now, we'll use placeholder UUIDs that you should replace

-- Insert sample business
INSERT INTO businesses (
    id,
    slug,
    name,
    description,
    email,
    phone,
    whatsapp_number,
    address_line1,
    city,
    state,
    postal_code,
    country,
    is_active,
    is_published,
    primary_color,
    secondary_color
) VALUES 
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'joes-cafe',
    'Joe''s Cafe',
    'Cozy neighborhood cafe serving artisanal coffee and fresh pastries',
    'hello@joescafe.com',
    '+1-555-0123',
    '+15550123',
    '123 Main Street',
    'San Francisco',
    'CA',
    '94102',
    'US',
    true,
    true,
    '#1e293b',
    '#8b5cf6'
),
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'bella-italia',
    'Bella Italia',
    'Authentic Italian restaurant with homemade pasta and wood-fired pizza',
    'info@bellaitalia.com',
    '+1-555-0456',
    '+15550456',
    '456 Oak Avenue',
    'New York',
    'NY',
    '10001',
    'US',
    true,
    true,
    '#2c3e50',
    '#e74c3c'
);

-- Insert subscriptions for businesses
INSERT INTO subscriptions (business_id, plan, status, current_period_start, current_period_end)
VALUES 
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'pro',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
),
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'starter',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month'
);

-- =====================================================
-- JOE'S CAFE MENU
-- =====================================================

-- Categories for Joe's Cafe
INSERT INTO menu_categories (business_id, name, description, sort_order) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Coffee & Espresso', 'Premium coffee drinks made with locally roasted beans', 1),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Breakfast', 'Fresh breakfast items served all day', 2),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Pastries & Baked Goods', 'Made fresh daily in-house', 3),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Sandwiches & Salads', 'Lunch favorites with fresh ingredients', 4);

-- Menu items for Joe's Cafe
INSERT INTO menu_items (business_id, category_id, name, description, price, is_available, is_featured, tags, sort_order) VALUES
-- Coffee & Espresso
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    (SELECT id FROM menu_categories WHERE business_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d' AND name = 'Coffee & Espresso'),
    'Cappuccino',
    'Classic Italian coffee with steamed milk and foam',
    4.50,
    true,
    true,
    ARRAY['hot', 'caffeine'],
    1
),
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    (SELECT id FROM menu_categories WHERE business_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d' AND name = 'Coffee & Espresso'),
    'Latte',
    'Espresso with steamed milk',
    4.75,
    true,
    false,
    ARRAY['hot', 'caffeine'],
    2
),
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    (SELECT id FROM menu_categories WHERE business_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d' AND name = 'Coffee & Espresso'),
    'Cold Brew',
    'Smooth, refreshing cold brew coffee',
    5.00,
    true,
    true,
    ARRAY['cold', 'caffeine'],
    3
),
-- Breakfast
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    (SELECT id FROM menu_categories WHERE business_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d' AND name = 'Breakfast'),
    'Avocado Toast',
    'Sourdough toast with smashed avocado, cherry tomatoes, and feta',
    9.50,
    true,
    true,
    ARRAY['vegetarian', 'popular'],
    1
),
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    (SELECT id FROM menu_categories WHERE business_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d' AND name = 'Breakfast'),
    'Classic Eggs Benedict',
    'Poached eggs, Canadian bacon, hollandaise on English muffin',
    12.00,
    true,
    false,
    ARRAY['popular'],
    2
),
-- Pastries
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    (SELECT id FROM menu_categories WHERE business_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d' AND name = 'Pastries & Baked Goods'),
    'Almond Croissant',
    'Buttery croissant filled with almond cream',
    4.50,
    true,
    true,
    ARRAY['sweet', 'contains-nuts'],
    1
),
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    (SELECT id FROM menu_categories WHERE business_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d' AND name = 'Pastries & Baked Goods'),
    'Blueberry Muffin',
    'Fresh blueberries in a moist, tender muffin',
    3.75,
    true,
    false,
    ARRAY['sweet'],
    2
);

-- =====================================================
-- BELLA ITALIA MENU
-- =====================================================

-- Categories for Bella Italia
INSERT INTO menu_categories (business_id, name, description, sort_order) VALUES
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Antipasti', 'Traditional Italian starters', 1),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Pasta', 'Homemade pasta dishes', 2),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Pizza', 'Wood-fired pizzas with fresh mozzarella', 3),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Dolci', 'Desserts', 4);

-- Menu items for Bella Italia
INSERT INTO menu_items (business_id, category_id, name, description, price, is_available, is_featured, tags, sort_order) VALUES
-- Antipasti
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    (SELECT id FROM menu_categories WHERE business_id = 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e' AND name = 'Antipasti'),
    'Bruschetta',
    'Grilled bread with tomatoes, garlic, basil, and olive oil',
    8.50,
    true,
    true,
    ARRAY['vegetarian', 'vegan-option'],
    1
),
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    (SELECT id FROM menu_categories WHERE business_id = 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e' AND name = 'Antipasti'),
    'Caprese Salad',
    'Fresh mozzarella, tomatoes, basil, balsamic',
    11.00,
    true,
    false,
    ARRAY['vegetarian', 'gluten-free'],
    2
),
-- Pasta
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    (SELECT id FROM menu_categories WHERE business_id = 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e' AND name = 'Pasta'),
    'Spaghetti Carbonara',
    'Classic Roman pasta with eggs, pecorino, guanciale',
    16.50,
    true,
    true,
    ARRAY['popular', 'signature'],
    1
),
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    (SELECT id FROM menu_categories WHERE business_id = 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e' AND name = 'Pasta'),
    'Fettuccine Alfredo',
    'Fresh fettuccine in creamy parmesan sauce',
    15.00,
    true,
    false,
    ARRAY['vegetarian'],
    2
),
-- Pizza
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    (SELECT id FROM menu_categories WHERE business_id = 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e' AND name = 'Pizza'),
    'Margherita',
    'San Marzano tomatoes, fresh mozzarella, basil',
    14.00,
    true,
    true,
    ARRAY['vegetarian', 'classic'],
    1
),
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    (SELECT id FROM menu_categories WHERE business_id = 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e' AND name = 'Pizza'),
    'Diavola',
    'Tomato sauce, mozzarella, spicy salami',
    16.50,
    true,
    true,
    ARRAY['spicy', 'popular'],
    2
),
-- Dolci
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    (SELECT id FROM menu_categories WHERE business_id = 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e' AND name = 'Dolci'),
    'Tiramisu',
    'Classic Italian dessert with espresso and mascarpone',
    8.00,
    true,
    true,
    ARRAY['signature', 'contains-alcohol'],
    1
);

-- =====================================================
-- QR CODES
-- =====================================================

INSERT INTO qr_codes (business_id, name, code, destination_url, table_number, location) VALUES
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Table 1',
    'joes-cafe-table-1',
    '/joes-cafe?table=1',
    '1',
    'Main Dining'
),
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Table 2',
    'joes-cafe-table-2',
    '/joes-cafe?table=2',
    '2',
    'Main Dining'
),
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Counter Pickup',
    'joes-cafe-counter',
    '/joes-cafe?location=counter',
    NULL,
    'Counter'
),
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'Table 5',
    'bella-italia-table-5',
    '/bella-italia?table=5',
    '5',
    'Main Dining'
);

-- =====================================================
-- SAMPLE ANALYTICS DATA
-- =====================================================

-- Generate sample analytics events for the last 30 days
DO $$
DECLARE
    business_id_1 UUID := 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
    business_id_2 UUID := 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e';
    i INTEGER;
    random_date TIMESTAMPTZ;
BEGIN
    FOR i IN 1..100 LOOP
        random_date := NOW() - (random() * INTERVAL '30 days');
        
        -- Menu views
        INSERT INTO analytics_events (business_id, event_type, created_at)
        VALUES (
            CASE WHEN random() > 0.5 THEN business_id_1 ELSE business_id_2 END,
            'menu_view',
            random_date
        );
        
        -- QR scans
        IF random() > 0.3 THEN
            INSERT INTO analytics_events (business_id, event_type, created_at)
            VALUES (
                CASE WHEN random() > 0.5 THEN business_id_1 ELSE business_id_2 END,
                'qr_scan',
                random_date
            );
        END IF;
        
        -- WhatsApp clicks
        IF random() > 0.7 THEN
            INSERT INTO analytics_events (business_id, event_type, created_at)
            VALUES (
                CASE WHEN random() > 0.5 THEN business_id_1 ELSE business_id_2 END,
                'whatsapp_click',
                random_date
            );
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- BUSINESS SETTINGS
-- =====================================================

INSERT INTO business_settings (business_id, key, value) VALUES
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'theme',
    '{"primaryColor": "#1e293b", "secondaryColor": "#8b5cf6", "fontFamily": "Inter"}'::jsonb
),
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'menu_display',
    '{"showPrices": true, "showImages": true, "showDescriptions": true}'::jsonb
),
(
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'theme',
    '{"primaryColor": "#2c3e50", "secondaryColor": "#e74c3c", "fontFamily": "Playfair Display"}'::jsonb
);
