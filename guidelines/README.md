# Database Setup Instructions

This directory contains the SQL schema and seed data for the **Thing in Tech** platform.

## 📋 Files

- **`schema.sql`** - Complete database schema with tables, indexes, RLS policies, and functions
- **`seed.sql`** - Sample data for testing (2 businesses with menus, QR codes, and analytics)

## 🚀 Setup Instructions

### 1. Run in Supabase Dashboard

#### Option A: SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `schema.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Wait for completion ✓
7. Create a new query and paste contents of `seed.sql` (optional)
8. Click **Run**

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or execute SQL directly
psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f database/schema.sql
psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f database/seed.sql
```

### 2. Verify Installation

After running the schema, verify in Supabase Dashboard:

1. **Table Editor** → Check all tables are created:
   - ✓ profiles
   - ✓ businesses
   - ✓ business_members
   - ✓ subscriptions
   - ✓ menu_categories
   - ✓ menu_items
   - ✓ qr_codes
   - ✓ analytics_events
   - ✓ business_settings

2. **Database** → **Functions** → Verify functions:
   - ✓ handle_new_user()
   - ✓ increment_qr_scan_count()
   - ✓ get_business_stats()
   - ✓ get_analytics_by_date()
   - ✓ user_has_business_access()

3. **Authentication** → **Policies** → Check RLS is enabled on all tables

### 3. Connect Your First User

After signing up a user through your app:

```sql
-- Replace 'YOUR_USER_ID' with the actual UUID from auth.users
-- Create a business for this user
INSERT INTO businesses (slug, name, email, phone, is_active, is_published)
VALUES ('my-restaurant', 'My Restaurant', 'me@restaurant.com', '+1234567890', true, true)
RETURNING id;

-- Add yourself as the business owner (replace both UUIDs)
INSERT INTO business_members (business_id, user_id, role)
VALUES ('BUSINESS_ID_FROM_ABOVE', 'YOUR_USER_ID', 'owner');
```

## 📊 Database Schema Overview

### Core Tables

#### `businesses`
Stores restaurant/business information, branding, contact details, and settings.

#### `business_members`
Many-to-many relationship between users and businesses with role-based access.

#### `menu_categories` & `menu_items`
Hierarchical menu structure with categories containing items.

#### `qr_codes`
Generated QR codes with tracking and location information.

#### `analytics_events`
Event tracking for menu views, QR scans, clicks, etc.

#### `subscriptions`
Subscription and billing information (Stripe integration ready).

### Key Features

✅ **Row Level Security (RLS)** - All tables protected with granular policies
✅ **Multi-tenant** - Multiple businesses per user, multiple users per business
✅ **Role-based Access** - Owner, Admin, Manager, Staff roles
✅ **Analytics** - Built-in event tracking and aggregation functions
✅ **Soft Deletes** - Use is_active flags instead of deleting data
✅ **Timestamps** - Automatic created_at and updated_at tracking
✅ **Indexes** - Optimized for common queries

## 🔐 Row Level Security

All tables have RLS enabled:

- **Public Access**: Published business menus are viewable by anyone
- **Member Access**: Business members can view/edit their business data
- **Owner/Admin**: Special permissions for sensitive operations
- **Analytics**: Public can insert events, only members can view

## 🎯 Useful Queries

### Get business with menu
```sql
SELECT 
  b.*,
  json_agg(
    json_build_object(
      'category', mc.name,
      'items', (
        SELECT json_agg(mi.*)
        FROM menu_items mi
        WHERE mi.category_id = mc.id
      )
    )
  ) as menu
FROM businesses b
LEFT JOIN menu_categories mc ON mc.business_id = b.id
WHERE b.slug = 'joes-cafe'
GROUP BY b.id;
```

### Get business stats
```sql
SELECT get_business_stats('YOUR_BUSINESS_ID');
```

### Get analytics for date range
```sql
SELECT * FROM get_analytics_by_date(
  'YOUR_BUSINESS_ID',
  '2026-03-01'::timestamptz,
  '2026-04-01'::timestamptz
);
```

## 🔄 Migrations

For production, consider using Supabase migrations:

```bash
# Create a new migration
supabase migration new initial_schema

# Copy schema.sql content to the migration file
# Then apply
supabase db push
```

## 🆘 Troubleshooting

**Problem**: "permission denied for schema auth"
**Solution**: Make sure you're running as postgres user or use the SQL Editor in Supabase Dashboard

**Problem**: RLS policies blocking queries
**Solution**: Check you're authenticated and have proper business_members entry

**Problem**: Functions not found
**Solution**: Re-run the schema.sql file, functions must be created before policies

## 📚 Next Steps

1. ✓ Run `schema.sql` 
2. ✓ Run `seed.sql` (optional, for testing)
3. → Set up Supabase client in your React app
4. → Configure environment variables
5. → Test authentication flow
6. → Connect components to Supabase

---

**Need Help?** Check the Supabase documentation: https://supabase.com/docs
