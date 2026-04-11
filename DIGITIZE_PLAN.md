plan
meta
[React + Vite]{.badge .b-stack} [Supabase JS]{.badge .b-stack} [Supabase
Auth]{.badge .b-stack} [Platform: DIGITIZE (by Thing in Tech)]{.badge
.b-scope}

summary
summary-title
Execution order

order-row
[1 --- DB schema]{.order-item} [→]{.order-arrow} [2 --- Auth +
signup]{.order-item} [→]{.order-arrow} [3 --- Data layer]{.order-item}
[→]{.order-arrow} [4 --- Routing]{.order-item} [→]{.order-arrow} [5 ---
UI/UX]{.order-item} [→]{.order-arrow} [6 --- Public menu]{.order-item}

{.section .s1}
{.section-head onclick="toggle(this)"}
section-num
1

<div>

section-title
Database --- SETUP_DB_SCHEMA.sql

section-sub
Single consolidated file, safe for re-runs

</div>

section-body
task
task-label
[critical]{.prio .p-critical} Consolidate all SQL into one file

task-body
Create `SETUP_DB_SCHEMA.sql` that replaces: `schema.sql`,
`qr_service_migration.sql`, `fix_recursion.sql`,
`persist_migration.sql`, `storage.sql`. Every object must use
`CREATE ... IF NOT EXISTS` and `DROP POLICY IF EXISTS` before recreating
so the file is safely re-runnable on an existing database.

decision
**Decision:** Consolidate + safe re-run (not replace-only). Preserves
existing data.

task
task-label
[critical]{.prio .p-critical} Core table order with correct FKs

task-body
Build order: `extensions` → `businesses` → `business_members` →
`subscriptions` → `menu_categories` → `menu_items` → `qr_codes` →
`business_menus` → `menu_templates` → `analytics_events` →
`business_settings`. Add `domains` table for future subdomain support.

task
task-label
[critical]{.prio .p-critical} Fix RLS infinite recursion permanently

task-body
Inline the `fix_recursion.sql` security-definer functions
`check_user_is_business_member()` and `check_user_is_business_admin()`
at the top of the schema, before any policies. All RLS policies on
`business_members`, `businesses`, `menu_categories`, `menu_items` must
use these functions --- no inline subquery recursion.

task
task-label
[high]{.prio .p-high} Add slug + subdomain columns to businesses

task-body
`businesses` table must include: `slug TEXT UNIQUE NOT NULL`,
`subdomain TEXT UNIQUE` (nullable, for future paid plans). Add a
`UNIQUE INDEX` on slug. The public menu URL strategy is
`yourdomain.com/slug` now; `subdomain` column is reserved but unused
until tier upgrade logic is built.

decision
**Decision:** Path-based URLs now (`/slug`). Subdomain column stored for
future paid tier.

task
task-label
[high]{.prio .p-high} Remove all seed/demo data from schema file

task-body
`SETUP_DB_SCHEMA.sql` must contain zero INSERT statements. Move sample
data to a separate `DEV_SEED.sql` file (clearly marked dev-only, never
run in production). Remove `seed.sql` and `persist_seed.sql` references
from the main flow.

task
task-label
[normal]{.prio .p-normal} Inline storage bucket setup

task-body
Merge `storage.sql` bucket creation and RLS policies into
`SETUP_DB_SCHEMA.sql` as the final section. Use
`ON CONFLICT (id) DO NOTHING` on bucket inserts. Required buckets:
`business-logos`, `menu-items`, `qr-codes`, `menu-uploads` (private),
`menus`, `avatars`.

{.section .s2}
{.section-head onclick="toggle(this)"}
section-num
2

<div>

section-title
Authentication + Registration flow

section-sub
Business name collected at signup, before email confirmation

</div>

section-body
task
task-label
[critical]{.prio .p-critical} Extend signup form --- collect business
name

task-body
The signup form must have three fields: `email`, `password`,
`business_name` (required). Pass `business_name` as
`options.data.business_name` in `supabase.auth.signUp()` so it lands in
`auth.users.raw_user_meta_data`.

decision
**Decision:** Collected during signup (before email confirmation), not
on a post-login screen.

task
task-label
[critical]{.prio .p-critical} Auto-create business record on first login

task-body
Create a Supabase Database Function (or Edge Function) triggered on
`auth.users INSERT`. It must: auto-generate a unique `slug` from
`business_name` (lowercase, hyphenated, deduplicated with suffix if
collision), insert into `businesses`, insert the user as `owner` in
`business_members`, insert a `free` subscription into `subscriptions`.
This ensures every authenticated user always has a business record.

task
task-label
[high]{.prio .p-high} Auth state machine --- define all possible states

task-body
The frontend must handle exactly four states on login:

- **Authenticated + business found** → go to dashboard
- **Authenticated + no business** → trigger business creation, then
  dashboard
- **Authenticated + email unconfirmed** → show confirmation prompt
- **Not authenticated** → redirect to login

Never show a blank screen or infinite spinner in any state.

task
task-label
[high]{.prio .p-high} Redirect logic after login/logout

task-body
After login → `/dashboard`. After logout → `/login`. After signup →
`/dashboard` (business was auto-created). Protected routes must redirect
unauthenticated users to `/login`, preserving the intended destination
in a `redirect` query param for post-login redirect.

{.section .s3}
{.section-head onclick="toggle(this)"}
section-num
3

<div>

section-title
Data layer --- fix the \"Loading\...\" problem

section-sub
Single source of truth, no more localStorage/DB split

</div>

section-body
task
task-label
[critical]{.prio .p-critical} Audit and eliminate localStorage usage

task-body
Search the entire codebase for `localStorage`. For each usage, decide:
(a) if it\'s business/profile data → move to Supabase, (b) if it\'s UI
preference (theme, sidebar state) → keep as localStorage only. Never
store business data in localStorage as source of truth. The sidebar
showing \"Loading\...\" is caused by business data being fetched from
localStorage that doesn\'t exist --- this must be fixed by fetching from
Supabase on session load.

decision
**Current problem:** Data is mixed across localStorage + Supabase. Fix:
Supabase is the only source of truth for all business data.

task
task-label
[critical]{.prio .p-critical} Global app context --- fetch business on
session load

task-body
Create a React context (e.g. `BusinessContext`) that on
`supabase.auth.onAuthStateChange` fires a single query: fetch user\'s
business + subscription via `business_members` join. Cache this in
context state. Every page reads from context --- no page-level business
fetches. Context must expose: `business`, `subscription`, `isLoading`,
`error`, `refetch()`.

task
task-label
[high]{.prio .p-high} Implement fallback / empty states everywhere

task-body
Every page that reads from context must handle three states:

- `isLoading = true` → show skeleton UI (not spinner text)
- `business = null` → show setup prompt with CTA
- `business exists` → show normal content

System must never crash or show raw errors to users. All API calls
wrapped in try/catch with graceful fallback UI.

task
task-label
[high]{.prio .p-high} Workspace sidebar --- show real business name

task-body
The sidebar currently shows \"Loading\...\" permanently because it reads
from a source that never resolves. Fix: sidebar reads `business.name`
from `BusinessContext`. Show skeleton during load. Show business name
once loaded. The \"D\" avatar should use the first letter of
`business.name`, not a hardcoded \"D\".

{.section .s4}
{.section-head onclick="toggle(this)"}
section-num
4

<div>

section-title
Routing --- audit, fix dead links, add public menu

section-sub
React Router v6, path-based public menu URLs

</div>

section-body
task
task-label
[critical]{.prio .p-critical} Public menu route --- `/:slug`

task-body
Add a public route `/:slug` that renders the customer-facing menu page.
This route must be accessible without authentication. It fetches the
business by slug, and the menu template from `menu_templates`. It
renders the correct template (e.g. Cafeteria Dark) with the business\'s
menu categories and items.

decision
**URL strategy:** `yourdomain.com/slug` (path-based). QR codes encode
`/slug` so domain changes never require reprinting.

task
task-label
[high]{.prio .p-high} Dashboard route structure

task-body
Verify all six dashboard routes work correctly and match nav links:

- `/dashboard` → Overview
- `/dashboard/profile` → Business Profile
- `/dashboard/menu` → Menu Maker
- `/dashboard/qr` → QR Setup
- `/dashboard/analytics` → Analytics
- `/dashboard/settings` → Settings

Remove any dead or mismatched route references. Add a `404` catch-all
that redirects to `/dashboard` for authenticated users or `/login` for
guests.

task
task-label
[high]{.prio .p-high} Auth route guards

task-body
Wrap all `/dashboard/*` routes in a `ProtectedRoute` component that
checks Supabase session. If no session, redirect to
`/login?redirect=/dashboard/...`. After login, redirect back to the
saved path. Public routes (`/login`, `/signup`, `/:slug`) must never
require auth.

task
task-label
[normal]{.prio .p-normal} QR code URL --- use encoded path, not
localhost

task-body
The QR Setup page currently shows `http://localhost:5173/r`. Fix: QR
codes must encode `/{slug}` only (the encoded_path column), never a full
URL with host. The full URL displayed in the dashboard UI is assembled
at render time from `window.location.origin + encoded_path`. The actual
PNG encoded in the QR image must only contain the path.

{.section .s5}
{.section-head onclick="toggle(this)"}
section-num
5

<div>

section-title
Frontend UX --- dashboard pages

section-sub
Each page connected to real Supabase data

</div>

section-body
task
task-label
[high]{.prio .p-high} Business Profile page --- save to Supabase

task-body
The \"Save Locally\" button must be renamed to \"Save\" and must call
`supabase.from('businesses').update()`, not write to localStorage. On
success, call `context.refetch()` to update the sidebar. Validate
required fields (business name) before submitting.

task
task-label
[high]{.prio .p-high} Overview page --- real counters from Supabase

task-body
Total Scans, Active Menu Items, Unique Visitors must query
`analytics_events` and `menu_items`. Customer Reviews stat can remain
static (4.8) until a reviews table exists. Recent Activity feed should
show last 3 real analytics events. Quick Actions buttons must link to
correct routes.

task
task-label
[high]{.prio .p-high} Menu Maker --- wire categories and items to DB

task-body
\"Add Manually\" must open a form that creates a real `menu_items`
record. Template selection (Cafeteria Dark / temp2) must update
`menu_templates` in Supabase. The \"Upload Menu File\" AI digitization
flow can remain as a stub with a \"coming soon\" state --- do not break
the page.

task
task-label
[high]{.prio .p-high} QR Setup --- create and persist QR records

task-body
\"Create New QR Area\" must insert into `qr_codes` table. Remove \"LOCAL
DRAFT\" badge --- QR areas are always persisted to DB. The QR PNG must
encode `/{slug}` only. \"Open Menu\" button must open `/{slug}` in a new
tab. \"Edit QR Style\" must update `qr_codes` columns (foreground_color,
background_color, qr_size, qr_style).

task
task-label
[normal]{.prio .p-normal} Analytics --- connect to analytics_events
table

task-body
Scan Activity chart must query `analytics_events` grouped by day for the
selected period (last 7 days default). Popular Items list should query
`menu_items` sorted by view count. Customer Reviews section can remain
UI-only until a review integration is built --- clearly mark as \"sample
data\" in that case.

task
task-label
[normal]{.prio .p-normal} Settings --- save account + business fields to
Supabase

task-body
Owner Name → update `auth.users` metadata via
`supabase.auth.updateUser()`. Business Name + Website → update
`businesses` table. Password change → use
`supabase.auth.updateUser({ password })`. Timezone/Language preferences
→ store in `business_settings` as key/value. All saves must show a
success/error toast.

{.section .s6}
{.section-head onclick="toggle(this)"}
section-num
6

<div>

section-title
Public menu page --- customer-facing /:slug

section-sub
No auth required, renders business menu by slug

</div>

section-body
task
task-label
[high]{.prio .p-high} Fetch business and menu by slug

task-body
On mount, query: `businesses` by slug (must be `is_published = true`),
then `menu_templates` by `(business_id, slug)`, then `menu_categories` +
`menu_items` by `business_id`. If business not found or not published →
show a clean 404 page (not a crash). This query is unauthenticated ---
relies on the public RLS policies set up in the schema.

task
task-label
[high]{.prio .p-high} Render correct template (Cafeteria Dark as
default)

task-body
Read `menu_templates.template_id` and render the matching template
component. Cafeteria Dark is the default if no template is set. Template
must use `primary_color`, `secondary_color`, `cafeteria_subtitle`,
`footer_handle`, `footer_website` from the `menu_templates` row.

task
task-label
[normal]{.prio .p-normal} Track analytics event on page load

task-body
On public menu page load, fire an unauthenticated insert to
`analytics_events` with `event_type = 'menu_view'` and the
`business_id`. Use Supabase\'s anon key for this --- no user auth
needed. This powers the scan/view counters in the dashboard.
