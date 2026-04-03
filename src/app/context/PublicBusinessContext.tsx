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

      // Handle Preview Mode from localStorage
      if (isPreview) {
        const bId = previewId || 'local';
        const menuDataKey = `digitize_menu_data_${bId}`;
        const templateKey = `digitize_template_${bId === 'local' ? 'default' : bId}`;
        
        try {
          const localMenuJSON = localStorage.getItem(menuDataKey);
          const localTemplateJSON = localStorage.getItem(templateKey);
          
          const cachedMenu = localMenuJSON ? JSON.parse(localMenuJSON) : { items: [], categories: [] };
          const cachedTemplate = localTemplateJSON ? JSON.parse(localTemplateJSON) : {};

          if (isMounted) {
            setBusiness({
              id: bId,
              name: cachedTemplate.templateName || 'My Preview Menu',
              slug: slug || 'preview',
              description: cachedTemplate.cafeteriaSubtitle || null,
              logo_url: null,
              cover_image_url: null,
              city: null,
              phone: null,
              whatsapp_number: null,
              primary_color: cachedTemplate.primaryColor || '#6b2d0f',
            } as PublicBusiness);

            if (cachedMenu.categories?.length) {
               setCategories(['All', ...cachedMenu.categories.map((c: any) => c.name)]);
            } else {
               setCategories(['All']);
            }

            if (cachedMenu.items?.length) {
               setMenuItems(cachedMenu.items.map((i: any) => ({
                 id: i.id,
                 name: i.name,
                 description: i.description,
                 price: i.price,
                 image_url: i.image_url,
                 is_featured: i.is_featured,
                 category: i.category?.name || 'Uncategorized'
               })));
            }
            setLoading(false);
          }
        } catch(e) {
          if (isMounted) { setError('Failed to load preview context'); setLoading(false); }
        }
        return;
      }

      const localProfileJson = localStorage.getItem('local_business_profile');
      const localMenusJson = localStorage.getItem('local_menus');
      const localProfile = localProfileJson ? JSON.parse(localProfileJson) : null;
      const localMenus = localMenusJson ? JSON.parse(localMenusJson) : [];

      // Also check local_qr_codes array to find which slug maps to which menu
      let localQRs: any[] = [];
      try { localQRs = JSON.parse(localStorage.getItem('local_qr_codes') || '[]'); } catch {}
      const matchedQR = localQRs.find((qr: any) => qr.encoded_path === `/${slug}`);

      // Local fallback for a local profile slug or any registered QR slug
      if ((localProfile && localProfile.slug === slug) || matchedQR) {
        const effectiveSlug = matchedQR ? slug : localProfile.slug;

        // Try keys in priority order: explicit slug → profile slug → 'local'
        // This handles data created before multi-QR support (stored under 'local')
        const candidateMenuKeys = [
          `digitize_menu_data_${effectiveSlug}`,
          ...(localProfile?.slug && localProfile.slug !== effectiveSlug ? [`digitize_menu_data_${localProfile.slug}`] : []),
          'digitize_menu_data_local',
        ];
        const candidateTemplateKeys = [
          `digitize_template_${effectiveSlug}`,
          ...(localProfile?.slug && localProfile.slug !== effectiveSlug ? [`digitize_template_${localProfile.slug}`] : []),
          `digitize_template_local`,
        ];

        let cachedMenu: any = { items: [], categories: [] };
        let cachedTemplate: any = {};

        for (const key of candidateMenuKeys) {
          const raw = localStorage.getItem(key);
          if (raw) { try { const parsed = JSON.parse(raw); if (parsed.items?.length || parsed.categories?.length) { cachedMenu = parsed; break; } } catch {} }
        }
        for (const key of candidateTemplateKeys) {
          const raw = localStorage.getItem(key);
          if (raw) { try { const parsed = JSON.parse(raw); if (parsed.templateId) { cachedTemplate = parsed; break; } } catch {} }
        }

        if (isMounted) {
          const profileName = localProfile?.name || cachedTemplate.templateName || 'Menu';
          setBusiness({
            id: localProfile?.id ?? 'local-' + slug,
            name: profileName,
            slug: effectiveSlug,
            description: localProfile?.description ?? cachedTemplate.cafeteriaSubtitle ?? null,
            logo_url: localProfile?.logo_url ?? null,
            cover_image_url: localProfile?.cover_image_url ?? null,
            city: localProfile?.city ?? null,
            phone: localProfile?.phone ?? null,
            whatsapp_number: localProfile?.whatsapp_number ?? null,
            primary_color: localProfile?.primary_color ?? cachedTemplate.primaryColor ?? null,
          } as PublicBusiness);

          const uploadedData = (localMenus || []).map((m: any) => ({
            id: m.id,
            label: m.label,
            file_type: m.file_type,
            public_url: m.file_url,
          }));
          setUploadedMenus(uploadedData);

          // Load structured menu items
          if (cachedMenu.categories?.length) {
            setCategories(['All', ...cachedMenu.categories.map((c: any) => c.name)]);
          }
          if (cachedMenu.items?.length) {
            setMenuItems(cachedMenu.items.map((i: any) => ({
              id: i.id,
              name: i.name,
              description: i.description,
              price: i.price,
              image_url: i.image_url,
              is_featured: i.is_featured,
              category: i.category?.name || 'Uncategorized',
            })));
          }

          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setError('Menu not found');
        setLoading(false);
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
