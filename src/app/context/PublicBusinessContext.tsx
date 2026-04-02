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

interface PublicBusinessContextType {
  slug: string;
  business: PublicBusiness | null;
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
  const [uploadedMenus, setUploadedMenus] = useState<UploadedMenu[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = resolveSubdomain() ?? businessSlug ?? '';

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const { data: biz, error: bizError } = await supabase
          .from('businesses')
          .select('id,name,slug,logo_url,cover_image_url,city,whatsapp_number,description,phone,primary_color')
          .eq('slug', slug)
          .single();

        if (bizError || !biz) {
          if (isMounted) {
            setError('Menu not found');
            setLoading(false);
          }
          return;
        }

        if (isMounted) setBusiness(biz);

        const [{ data: uploadedData }, { data: cData }, { data: iData }] = await Promise.all([
          supabase.from('business_menus')
            .select('id,label,file_type,public_url')
            .eq('business_id', biz.id).eq('is_active', true).order('sort_order'),
          supabase.from('menu_categories')
            .select('id,name').eq('business_id', biz.id).order('sort_order'),
          supabase.from('menu_items')
            .select('id,name,description,price,image_url,is_featured,category:menu_categories(name)')
            .eq('business_id', biz.id).eq('is_available', true).order('sort_order'),
        ]);

        if (!isMounted) return;

        if (uploadedData?.length) {
          setUploadedMenus(uploadedData as UploadedMenu[]);
        }

        if (cData) {
          setCategories(['All', ...cData.map(c => c.name)]);
        }

        if (iData) {
          setMenuItems(iData.map((i: any) => ({
            id: i.id,
            name: i.name,
            description: i.description,
            price: i.price,
            image_url: i.image_url,
            is_featured: i.is_featured,
            category: Array.isArray(i.category) ? (i.category[0]?.name ?? '') : (i.category?.name ?? ''),
          })));
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error loading public business context');
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
