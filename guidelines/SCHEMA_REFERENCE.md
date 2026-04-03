# Database Schema Reference

## Table of Contents

- [Entity Relationship Overview](#entity-relationship-overview)
- [Tables](#tables)
- [Functions](#functions)
- [Security & RLS](#security--rls)
- [Common Queries](#common-queries)

## Entity Relationship Overview

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       ▼
┌─────────────┐         ┌──────────────────┐
│  profiles   │◄───────►│ business_members │
└─────────────┘         └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────┐
                        │  businesses  │
                        └──────┬───────┘
                               │
                ┌──────────────┼──────────────┬─────────────┐
                ▼              ▼              ▼             ▼
        ┌───────────────┐ ┌─────────┐ ┌───────────────┐ ┌────────────────┐
        │subscriptions  │ │qr_codes │ │menu_categories│ │analytics_events│
        └───────────────┘ └─────────┘ └──────┬────────┘ └────────────────┘
                                              ▼
                                      ┌──────────────┐
                                      │  menu_items  │
                                      └──────────────┘
```

## Tables

### `profiles`

Extends Supabase `auth.users` with additional user information.

| Column     | Type        | Description                            |
| ---------- | ----------- | -------------------------------------- |
| id         | UUID        | Primary key, references auth.users(id) |
| email      | TEXT        | User's email (unique)                  |
| full_name  | TEXT        | User's display name                    |
| avatar_url | TEXT        | URL to user's profile picture          |
| phone      | TEXT        | Contact phone number                   |
| created_at | TIMESTAMPTZ | Account creation timestamp             |
| updated_at | TIMESTAMPTZ | Last update timestamp                  |

**Indexes:**

- `idx_profiles_email` on `email`

**RLS Policies:**

- Users can view their own profile
- Users can update their own profile

---

### `businesses`

Core table for restaurant/business information.

| Column          | Type          | Description                            |
| --------------- | ------------- | -------------------------------------- |
| id              | UUID          | Primary key                            |
| slug            | TEXT          | Unique URL-friendly identifier         |
| name            | TEXT          | Business name                          |
| description     | TEXT          | Business description                   |
| logo_url        | TEXT          | URL to logo image                      |
| cover_image_url | TEXT          | URL to cover/hero image                |
| email           | TEXT          | Business contact email                 |
| phone           | TEXT          | Business phone number                  |
| whatsapp_number | TEXT          | WhatsApp number (with country code)    |
| website         | TEXT          | Business website URL                   |
| address_line1   | TEXT          | Street address                         |
| address_line2   | TEXT          | Apt/Suite/Floor                        |
| city            | TEXT          | City                                   |
| state           | TEXT          | State/Province                         |
| postal_code     | TEXT          | ZIP/Postal code                        |
| country         | TEXT          | Country code (default: 'US')           |
| latitude        | DECIMAL(10,8) | GPS latitude                           |
| longitude       | DECIMAL(11,8) | GPS longitude                          |
| google_maps_url | TEXT          | Google Maps link                       |
| google_place_id | TEXT          | Google Place ID for API                |
| currency        | TEXT          | Currency code (default: 'USD')         |
| timezone        | TEXT          | Timezone (default: 'America/New_York') |
| is_active       | BOOLEAN       | Business active status                 |
| is_published    | BOOLEAN       | Public menu published                  |
| primary_color   | TEXT          | Brand primary color hex                |
| secondary_color | TEXT          | Brand secondary color hex              |
| created_at      | TIMESTAMPTZ   | Creation timestamp                     |
| updated_at      | TIMESTAMPTZ   | Last update timestamp                  |

**Constraints:**

- `slug` must match pattern `^[a-z0-9-]+$`

**Indexes:**

- `idx_businesses_slug` on `slug`
- `idx_businesses_is_active` on `is_active`
- `idx_businesses_is_published` on `is_published`
- `idx_businesses_created_at` on `created_at DESC`

**RLS Policies:**

- Anyone can view published businesses
- Business members can view their businesses
- Owners/admins can update business
- Owners can delete business

---

### `business_members`

Junction table for user-business relationship with roles.

| Column      | Type        | Description                                     |
| ----------- | ----------- | ----------------------------------------------- |
| id          | UUID        | Primary key                                     |
| business_id | UUID        | References businesses(id)                       |
| user_id     | UUID        | References profiles(id)                         |
| role        | member_role | Role enum: 'owner', 'admin', 'manager', 'staff' |
| invited_at  | TIMESTAMPTZ | When user was invited                           |
| joined_at   | TIMESTAMPTZ | When user joined                                |
| invited_by  | UUID        | References profiles(id)                         |

**Constraints:**

- Unique combination of `(business_id, user_id)`

**Indexes:**

- `idx_business_members_business_id` on `business_id`
- `idx_business_members_user_id` on `user_id`
- `idx_business_members_role` on `role`

**RLS Policies:**

- Users can view members of businesses they belong to
- Owners/admins can manage members

---

### `subscriptions`

Subscription and billing information.

| Column                 | Type                | Description                                            |
| ---------------------- | ------------------- | ------------------------------------------------------ |
| id                     | UUID                | Primary key                                            |
| business_id            | UUID                | References businesses(id), unique                      |
| plan                   | subscription_plan   | 'free', 'starter', 'pro', 'enterprise'                 |
| status                 | subscription_status | 'trialing', 'active', 'canceled', 'past_due', 'unpaid' |
| stripe_customer_id     | TEXT                | Stripe customer ID                                     |
| stripe_subscription_id | TEXT                | Stripe subscription ID                                 |
| stripe_price_id        | TEXT                | Stripe price ID                                        |
| trial_ends_at          | TIMESTAMPTZ         | Trial expiration                                       |
| current_period_start   | TIMESTAMPTZ         | Billing period start                                   |
| current_period_end     | TIMESTAMPTZ         | Billing period end                                     |
| cancel_at              | TIMESTAMPTZ         | Scheduled cancellation date                            |
| canceled_at            | TIMESTAMPTZ         | Actual cancellation date                               |
| created_at             | TIMESTAMPTZ         | Creation timestamp                                     |
| updated_at             | TIMESTAMPTZ         | Last update timestamp                                  |

**Indexes:**

- `idx_subscriptions_business_id` on `business_id`
- `idx_subscriptions_status` on `status`
- `idx_subscriptions_plan` on `plan`
- `idx_subscriptions_current_period_end` on `current_period_end`

**RLS Policies:**

- Business members can view subscription
- Owners/admins can manage subscription

---

### `menu_categories`

Menu category groupings.

| Column      | Type        | Description                   |
| ----------- | ----------- | ----------------------------- |
| id          | UUID        | Primary key                   |
| business_id | UUID        | References businesses(id)     |
| name        | TEXT        | Category name                 |
| description | TEXT        | Category description          |
| image_url   | TEXT        | Category image URL            |
| sort_order  | INTEGER     | Display order (default: 0)    |
| is_active   | BOOLEAN     | Active status (default: true) |
| created_at  | TIMESTAMPTZ | Creation timestamp            |
| updated_at  | TIMESTAMPTZ | Last update timestamp         |

**Indexes:**

- `idx_menu_categories_business_id` on `business_id`
- `idx_menu_categories_sort_order` on `(business_id, sort_order)`
- `idx_menu_categories_is_active` on `is_active`

**RLS Policies:**

- Anyone can view categories of published businesses
- Business members can manage categories

---

### `menu_items`

Individual menu items.

| Column           | Type          | Description                                |
| ---------------- | ------------- | ------------------------------------------ |
| id               | UUID          | Primary key                                |
| business_id      | UUID          | References businesses(id)                  |
| category_id      | UUID          | References menu_categories(id)             |
| name             | TEXT          | Item name                                  |
| description      | TEXT          | Item description                           |
| price            | DECIMAL(10,2) | Item price                                 |
| image_url        | TEXT          | Item image URL                             |
| is_available     | BOOLEAN       | Available for order (default: true)        |
| is_featured      | BOOLEAN       | Featured item (default: false)             |
| preparation_time | INTEGER       | Prep time in minutes                       |
| calories         | INTEGER       | Calorie count                              |
| tags             | TEXT[]        | Array of tags ['spicy', 'vegan', etc.]     |
| allergens        | TEXT[]        | Array of allergens ['nuts', 'dairy', etc.] |
| sort_order       | INTEGER       | Display order (default: 0)                 |
| created_at       | TIMESTAMPTZ   | Creation timestamp                         |
| updated_at       | TIMESTAMPTZ   | Last update timestamp                      |

**Indexes:**

- `idx_menu_items_business_id` on `business_id`
- `idx_menu_items_category_id` on `category_id`
- `idx_menu_items_is_available` on `is_available`
- `idx_menu_items_is_featured` on `is_featured`
- `idx_menu_items_sort_order` on `(category_id, sort_order)`
- `idx_menu_items_tags` GIN index on `tags`

**RLS Policies:**

- Anyone can view items of published businesses
- Business members can manage items

---

### `qr_codes`

Generated QR codes for menu access.

| Column          | Type        | Description                             |
| --------------- | ----------- | --------------------------------------- |
| id              | UUID        | Primary key                             |
| business_id     | UUID        | References businesses(id)               |
| name            | TEXT        | QR code label (e.g., "Table 5")         |
| code            | TEXT        | Unique code identifier                  |
| qr_image_url    | TEXT        | URL to QR code image                    |
| destination_url | TEXT        | Target URL when scanned                 |
| scan_count      | INTEGER     | Total scans (default: 0)                |
| last_scanned_at | TIMESTAMPTZ | Last scan timestamp                     |
| is_active       | BOOLEAN     | Active status (default: true)           |
| table_number    | TEXT        | Table number if applicable              |
| location        | TEXT        | Location (e.g., "Main Dining", "Patio") |
| created_at      | TIMESTAMPTZ | Creation timestamp                      |
| updated_at      | TIMESTAMPTZ | Last update timestamp                   |

**Indexes:**

- `idx_qr_codes_business_id` on `business_id`
- `idx_qr_codes_code` on `code`
- `idx_qr_codes_is_active` on `is_active`

**RLS Policies:**

- Business members can view and manage QR codes

---

### `analytics_events`

Event tracking for analytics.

| Column       | Type                 | Description                                                                        |
| ------------ | -------------------- | ---------------------------------------------------------------------------------- |
| id           | UUID                 | Primary key                                                                        |
| business_id  | UUID                 | References businesses(id)                                                          |
| event_type   | analytics_event_type | 'menu_view', 'item_view', 'qr_scan', 'whatsapp_click', 'phone_click', 'link_click' |
| qr_code_id   | UUID                 | References qr_codes(id), nullable                                                  |
| menu_item_id | UUID                 | References menu_items(id), nullable                                                |
| metadata     | JSONB                | Additional event data                                                              |
| user_agent   | TEXT                 | Browser user agent                                                                 |
| ip_address   | INET                 | IP address (anonymized)                                                            |
| referrer     | TEXT                 | Referrer URL                                                                       |
| country      | TEXT                 | Country code                                                                       |
| city         | TEXT                 | City name                                                                          |
| created_at   | TIMESTAMPTZ          | Event timestamp                                                                    |

**Indexes:**

- `idx_analytics_events_business_id` on `business_id`
- `idx_analytics_events_event_type` on `event_type`
- `idx_analytics_events_created_at` on `created_at DESC`
- `idx_analytics_events_qr_code_id` on `qr_code_id`
- `idx_analytics_events_menu_item_id` on `menu_item_id`

**RLS Policies:**

- Anyone can insert events (for tracking)
- Business members can view their analytics

---

### `business_settings`

Flexible key-value settings store.

| Column      | Type        | Description               |
| ----------- | ----------- | ------------------------- |
| id          | UUID        | Primary key               |
| business_id | UUID        | References businesses(id) |
| key         | TEXT        | Setting key               |
| value       | JSONB       | Setting value (JSON)      |
| created_at  | TIMESTAMPTZ | Creation timestamp        |
| updated_at  | TIMESTAMPTZ | Last update timestamp     |

**Constraints:**

- Unique combination of `(business_id, key)`

**Indexes:**

- `idx_business_settings_business_id` on `business_id`
- `idx_business_settings_key` on `key`

**RLS Policies:**

- Business members can view settings
- Owners/admins can manage settings

---

## Functions

### `handle_new_user()`

**Trigger function** - Automatically creates a profile when a new user signs up.

**Usage:** Automatically triggered on `auth.users` INSERT

---

### `increment_qr_scan_count(qr_code_uuid UUID)`

Increments scan count and updates last scanned timestamp for a QR code.

**Usage:**

```sql
SELECT increment_qr_scan_count('qr-code-uuid-here');
```

---

### `get_business_stats(business_uuid UUID)`

Returns JSON object with business statistics.

**Returns:**

```json
{
  "total_menu_items": 25,
  "total_categories": 5,
  "total_qr_codes": 10,
  "total_scans_today": 47,
  "total_views_today": 152,
  "total_scans_week": 312,
  "total_views_week": 1043
}
```

**Usage:**

```sql
SELECT get_business_stats('business-uuid-here');
```

---

### `get_analytics_by_date(business_uuid, start_date, end_date)`

Returns analytics aggregated by date within a date range.

**Returns:**
| Column | Type |
|--------|------|
| date | DATE |
| qr_scans | BIGINT |
| menu_views | BIGINT |
| item_views | BIGINT |
| whatsapp_clicks | BIGINT |

**Usage:**

```sql
SELECT * FROM get_analytics_by_date(
  'business-uuid-here',
  '2026-03-01'::timestamptz,
  '2026-04-01'::timestamptz
);
```

---

### `user_has_business_access(business_uuid, user_uuid)`

Checks if a user has access to a specific business.

**Returns:** BOOLEAN

**Usage:**

```sql
SELECT user_has_business_access('business-uuid', 'user-uuid');
```

---

## Security & RLS

### RLS Philosophy

1. **Public Data**: Published business menus are accessible to anyone
2. **Private Data**: Business management requires membership
3. **Role-Based**: Operations restricted by member role (owner/admin/manager/staff)
4. **Analytics**: Public can record events, only members can view

### Key Security Features

✅ All tables have RLS enabled
✅ Multi-tenant isolation by business_id
✅ Role-based access control
✅ Automatic updated_at timestamps
✅ Foreign key constraints with cascading deletes
✅ Input validation via constraints

---

## Common Queries

### Get complete menu for a business

```sql
SELECT
  b.id,
  b.slug,
  b.name,
  b.description,
  b.logo_url,
  b.whatsapp_number,
  json_agg(
    json_build_object(
      'id', mc.id,
      'name', mc.name,
      'description', mc.description,
      'sort_order', mc.sort_order,
      'items', (
        SELECT json_agg(
          json_build_object(
            'id', mi.id,
            'name', mi.name,
            'description', mi.description,
            'price', mi.price,
            'image_url', mi.image_url,
            'is_available', mi.is_available,
            'is_featured', mi.is_featured,
            'tags', mi.tags
          ) ORDER BY mi.sort_order
        )
        FROM menu_items mi
        WHERE mi.category_id = mc.id
        AND mi.is_available = true
      )
    ) ORDER BY mc.sort_order
  ) as categories
FROM businesses b
LEFT JOIN menu_categories mc ON mc.business_id = b.id AND mc.is_active = true
WHERE b.slug = 'joes-cafe'
AND b.is_published = true
GROUP BY b.id;
```

### Get user's businesses with role

```sql
SELECT
  b.*,
  bm.role,
  s.plan,
  s.status as subscription_status
FROM businesses b
INNER JOIN business_members bm ON bm.business_id = b.id
LEFT JOIN subscriptions s ON s.business_id = b.id
WHERE bm.user_id = auth.uid()
ORDER BY b.name;
```

### Track a menu view event

```sql
INSERT INTO analytics_events (
  business_id,
  event_type,
  metadata,
  user_agent
) VALUES (
  'business-uuid',
  'menu_view',
  '{"source": "qr_code", "table": "5"}'::jsonb,
  'Mozilla/5.0...'
);
```

### Get top menu items by views

```sql
SELECT
  mi.name,
  mi.price,
  COUNT(ae.id) as view_count
FROM menu_items mi
LEFT JOIN analytics_events ae ON ae.menu_item_id = mi.id
WHERE mi.business_id = 'business-uuid'
AND ae.event_type = 'item_view'
AND ae.created_at >= NOW() - INTERVAL '30 days'
GROUP BY mi.id, mi.name, mi.price
ORDER BY view_count DESC
LIMIT 10;
```

### Get weekly analytics summary

```sql
SELECT
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) FILTER (WHERE event_type = 'menu_view') as menu_views,
  COUNT(*) FILTER (WHERE event_type = 'qr_scan') as qr_scans,
  COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') as whatsapp_clicks,
  COUNT(DISTINCT DATE(created_at)) as active_days
FROM analytics_events
WHERE business_id = 'business-uuid'
AND created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;
```

---

## Data Types Reference

### Enums

**subscription_status:**

- `trialing` - Free trial period
- `active` - Active paid subscription
- `canceled` - Canceled but still active until period end
- `past_due` - Payment failed
- `unpaid` - Subscription unpaid

**subscription_plan:**

- `free` - Free tier
- `starter` - Starter plan
- `pro` - Professional plan
- `enterprise` - Enterprise plan

**member_role:**

- `owner` - Full access, can delete business
- `admin` - Nearly full access, can manage members
- `manager` - Can manage menu and QR codes
- `staff` - Read-only access

**analytics_event_type:**

- `menu_view` - Menu page viewed
- `item_view` - Menu item clicked/viewed
- `qr_scan` - QR code scanned
- `whatsapp_click` - WhatsApp button clicked
- `phone_click` - Phone number clicked
- `link_click` - External link clicked
