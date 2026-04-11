import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useParams } from 'react-router';
import { supabase } from '../../utils/supabase';
import { resolveSubdomain } from '../services/qrService';

export interface PublicBusiness {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  city: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  primary_color: string | null;
}

export interface UploadedMenu {
  id: string;
  label: string;
  file_type: 'pdf' | 'image';
  public_url: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_featured: boolean;
  category: string;
}

export interface MenuTemplate {
  id: string;
  template_id: string;
  template_name: string;
  primary_color: string | null;
  secondary_color: string | null;
  cafeteria_subtitle: string | null;
  footer_handle: string | null;
  footer_website: string | null;
  landing_headline: string | null;
  landing_subtext: string | null;
  landing_logo: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_tiktok: string | null;
  social_whatsapp: string | null;
  review_link: string | null;
  opening_hours: string | null;
}

interface PublicBusinessContextType {
  slug: string;
  business: PublicBusiness | null;
  template: MenuTemplate | null;
  uploadedMenus: UploadedMenu[];
  categories: string[];
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
}

const PublicBusinessContext = createContext<PublicBusinessContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function PublicBusinessProvider({ children }: Props) {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [template, setTemplate] = useState<MenuTemplate | null>(null);
  const [uploadedMenus, setUploadedMenus] = useState<UploadedMenu[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = resolveSubdomain() ?? businessSlug ?? '';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const previewId = urlParams.get('id');
    const isPreview = slug === 'preview' || Boolean(previewId);

    if (!slug && !isPreview) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Business Profile
        const { data: biz, error: bizErr } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .single();

        if (bizErr || !biz) {
          // If not found in DB, check localStorage for legacy/draft preview
          const localProfile = JSON.parse(localStorage.getItem('local_business_profile') || 'null');
          if (localProfile && localProfile.slug === slug && isMounted) {
             setBusiness(localProfile as PublicBusiness);
             setLoading(false);
             return;
          }
          throw new Error('Business not found');
        }

        if (isMounted) setBusiness(biz as PublicBusiness);

        // 2. Fetch Template Styles for this slug
        const { data: temp, error: tempErr } = await supabase
          .from('menu_templates')
          .select('*')
          .eq('business_id', biz.id)
          .eq('slug', slug)
          .maybeSingle();

        if (!tempErr && temp && isMounted) {
          setTemplate(temp as MenuTemplate);
        }

        // 3. Fetch Uploaded Menus
        const { data: mns, error: mnsErr } = await supabase
          .from('business_menus')
          .select('*')
          .eq('business_id', biz.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!mnsErr && mns && isMounted) {
          setUploadedMenus(mns as UploadedMenu[]);
        }

        // 4. Fetch Structured categories & items
        const { data: cats, error: catsErr } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('business_id', biz.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        const { data: items, error: itemsErr } = await supabase
          .from('menu_items')
          .select('*, category:menu_categories(name)')
          .eq('business_id', biz.id)
          .eq('is_available', true)
          .order('sort_order', { ascending: true });

        if (isMounted) {
          if (!catsErr && cats) {
            setCategories(['All', ...cats.map(c => c.name)]);
          }
          if (!itemsErr && items) {
            setMenuItems(items.map(i => ({
              id: i.id,
              name: i.name,
              description: i.description,
              price: i.price,
              image_url: i.image_url,
              is_featured: i.is_featured,
              category: (i.category as any)?.name || 'Uncategorized'
            })));
          }
        }

      } catch (err: any) {
        if (isMounted) {
          console.error('[PublicBusinessContext] Load error:', err);
          setError(err.message || 'Failed to load menu');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const value = {
    slug,
    business,
    template,
    uploadedMenus,
    categories,
    menuItems,
    loading,
    error,
  };

  return (
    <PublicBusinessContext.Provider value={value}>
      {children}
    </PublicBusinessContext.Provider>
  );
}

export function usePublicBusiness() {
  const context = useContext(PublicBusinessContext);
  if (context === undefined) {
    throw new Error('usePublicBusiness must be used within a PublicBusinessProvider');
  }
  return context;
}
