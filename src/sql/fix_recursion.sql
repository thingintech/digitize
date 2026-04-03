-- Fix recursion in business_members table policies

-- 1. Create security definer functions to bypass RLS for membership checks
-- These functions run with the privileges of the creator (postgres) and bypass RLS
-- This is the standard way to fix infinite recursion in Supabase RLS

CREATE OR REPLACE FUNCTION public.check_user_is_business_member(business_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_members
        WHERE business_id = business_uuid
        AND user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_user_is_business_admin(business_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_members
        WHERE business_id = business_uuid
        AND user_id = user_uuid
        AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of their businesses" ON public.business_members;
DROP POLICY IF EXISTS "Business owners/admins can manage members" ON public.business_members;

-- 3. Re-create policies using the security definer functions
-- For SELECT: A member can see all members of their business
CREATE POLICY "Members can view members of their businesses"
    ON public.business_members FOR SELECT
    USING (check_user_is_business_member(business_id, auth.uid()));

-- For ALL (Insert, Update, Delete): Only owners/admins can manage members
CREATE POLICY "Admins can manage members"
    ON public.business_members FOR ALL
    USING (check_user_is_business_admin(business_id, auth.uid()));

-- 4. Update businesses policy to also use the function for consistency and performance
DROP POLICY IF EXISTS "Anyone can view published businesses" ON public.businesses;
CREATE POLICY "Anyone can view published businesses"
    ON public.businesses FOR SELECT
    USING (is_published = true OR check_user_is_business_member(id, auth.uid()));

DROP POLICY IF EXISTS "Business owners/admins can update business" ON public.businesses;
CREATE POLICY "Business owners/admins can update business"
    ON public.businesses FOR UPDATE
    USING (check_user_is_business_admin(id, auth.uid()));

-- 5. Fix other tables that might be using recursive subqueries
-- menu_categories
DROP POLICY IF EXISTS "Anyone can view categories of published businesses" ON public.menu_categories;
CREATE POLICY "Anyone can view categories of published businesses"
    ON public.menu_categories FOR SELECT
    USING (
        is_active = true 
        OR check_user_is_business_member(business_id, auth.uid())
    );

DROP POLICY IF EXISTS "Business members can manage categories" ON public.menu_categories;
CREATE POLICY "Business members can manage categories"
    ON public.menu_categories FOR ALL
    USING (check_user_is_business_member(business_id, auth.uid()));

-- menu_items
DROP POLICY IF EXISTS "Anyone can view items of published businesses" ON public.menu_items;
CREATE POLICY "Anyone can view items of published businesses"
    ON public.menu_items FOR SELECT
    USING (
        is_available = true 
        OR check_user_is_business_member(business_id, auth.uid())
    );

DROP POLICY IF EXISTS "Business members can manage menu items" ON public.menu_items;
CREATE POLICY "Business members can manage menu items"
    ON public.menu_items FOR ALL
    USING (check_user_is_business_member(business_id, auth.uid()));
