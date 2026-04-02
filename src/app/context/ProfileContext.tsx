import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from './AuthContext';
import { generateQRImage, QRGenerateResult } from '../services/qrService';
import { toast } from 'sonner';

/**
 * Data Access Layer: ProfileContext
 * 
 * Manages all business-specific data (Business, Menus, QR Codes).
 * Synchronizes automatically with AuthContext.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Business {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  website: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
  is_published: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessMenu {
  id: string;
  business_id: string;
  label: string;
  file_type: 'pdf' | 'image';
  storage_path: string;
  public_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface QRCode {
  id: string;
  business_id: string;
  name: string;
  code: string;
  qr_image_url: string | null;
  destination_url: string;
  encoded_path: string | null;
  storage_path: string | null;
  foreground_color: string;
  background_color: string;
  scan_count: number;
  is_active: boolean;
  created_at: string;
}

export interface UpdateProfilePayload {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  cover_image_url?: string;
  is_published?: boolean;
  onboarding_step?: number;
}

interface ProfileContextType {
  business: Business | null;
  menus: BusinessMenu[];
  qrCode: QRCode | null;
  loading: boolean;
  error: string | null;
  isReady: boolean;

  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
  uploadLogo: (file: File) => Promise<string | null>;
  uploadMenu: (file: File, label: string) => Promise<BusinessMenu | null>;
  deleteMenu: (menuId: string, storagePath: string) => Promise<void>;
  generateQR: (options?: { foregroundColor?: string; backgroundColor?: string }) => Promise<QRCode | null>;
  refreshProfile: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function ensureUniqueSlug(base: string, currentId?: string): Promise<string> {
  let candidate = base;
  let attempt = 0;
  while (true) {
    const { data } = await supabase.from('businesses').select('id').eq('slug', candidate).maybeSingle();
    if (!data || data.id === currentId) return candidate;
    attempt++;
    candidate = `${base}-${Math.floor(Math.random() * 9000) + 1000}`;
    if (attempt > 10) return `${base}-${Date.now()}`;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [menus, setMenus] = useState<BusinessMenu[]>([]);
  const [qrCode, setQrCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async (userId: string, isRetry = false) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Find business membership
      const { data: memberData, error: memberError } = await supabase
        .from('business_members')
        .select('business_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (memberError) throw memberError;

      // 1b. If no business found, but we are inside a new session, try one more time
      // This handles the small delay in DB triggers during registration
      if (!memberData) {
        if (!isRetry) {
          console.log('[ProfileContext] No business found, retrying in 1.5s...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          return loadAll(userId, true);
        }
        setBusiness(null);
        setMenus([]);
        setQrCode(null);
        setLoading(false);
        return;
      }

      const businessId = memberData.business_id;

      // 2. Parallel fetch of all business resources
      const [bizRes, menusRes, qrRes] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', businessId).single(),
        supabase.from('business_menus').select('*').eq('business_id', businessId).order('sort_order', { ascending: true }),
        supabase.from('qr_codes').select('*').eq('business_id', businessId).eq('is_active', true).maybeSingle(),
      ]);

      if (bizRes.error) throw bizRes.error;
      setBusiness(bizRes.data as Business);
      setMenus((menusRes.data ?? []) as BusinessMenu[]);
      setQrCode(qrRes.data as QRCode | null);
    } catch (err: any) {
      setError(err.message || 'Failed to sync business data');
      console.error('[ProfileContext] bootstrap error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      loadAll(user.id);
    } else {
      setBusiness(null);
      setMenus([]);
      setQrCode(null);
      setLoading(false);
    }
  }, [user, authLoading, loadAll]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadAll(user.id);
  }, [user, loadAll]);

  const updateProfile = useCallback(async (data: UpdateProfilePayload) => {
    if (!business) throw new Error('No business found');
    let slug = business.slug;
    if (data.name && data.name !== business.name) {
      slug = await ensureUniqueSlug(slugify(data.name), business.id);
    }
    const { error } = await supabase
      .from('businesses')
      .update({ ...data, slug, updated_at: new Date().toISOString() })
      .eq('id', business.id);
    if (error) throw error;
    setBusiness(prev => prev ? { ...prev, ...data, slug } : prev);
  }, [business]);

  const uploadLogo = useCallback(async (file: File): Promise<string | null> => {
    if (!business) throw new Error('No business found');
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    const storagePath = `${business.id}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage.from('logos').upload(storagePath, file, { upsert: true, contentType: file.type });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;
    const { error: dbError } = await supabase.from('businesses').update({ logo_url: publicUrl }).eq('id', business.id);
    if (dbError) throw dbError;
    setBusiness(prev => prev ? { ...prev, logo_url: publicUrl } : prev);
    return publicUrl;
  }, [business]);

  const uploadMenu = useCallback(async (file: File, label: string): Promise<BusinessMenu | null> => {
    if (!business) throw new Error('No business found');
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    const storagePath = `${business.id}/${uniqueName}`;
    const { error: uploadError } = await supabase.storage.from('menus').upload(storagePath, file, { upsert: false, contentType: file.type });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from('menus').getPublicUrl(storagePath);
    const { data: menuRecord, error: dbError } = await supabase
      .from('business_menus')
      .insert({
        business_id: business.id,
        label,
        file_type: ext === 'pdf' ? 'pdf' : 'image',
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        is_active: true,
        sort_order: menus.length,
      })
      .select().single();
    if (dbError) throw dbError;
    const newMenu = menuRecord as BusinessMenu;
    setMenus(prev => [...prev, newMenu]);
    return newMenu;
  }, [business, menus.length]);

  const deleteMenu = useCallback(async (menuId: string, storagePath: string) => {
    await supabase.storage.from('menus').remove([storagePath]);
    const { error } = await supabase.from('business_menus').delete().eq('id', menuId);
    if (error) throw error;
    setMenus(prev => prev.filter(m => m.id !== menuId));
  }, []);

  const generateQR = useCallback(async (options: { foregroundColor?: string; backgroundColor?: string } = {}): Promise<QRCode | null> => {
    if (!business) throw new Error('No business found');
    const { foregroundColor = '#0f172a', backgroundColor = '#ffffff' } = options;
    const encodedPath = `/${business.slug}`;
    const storagePath = `${business.id}.png`;
    const result = await generateQRImage(encodedPath, { foregroundColor, backgroundColor });
    const { error: uploadError } = await supabase.storage.from('qr-codes').upload(storagePath, result.blob, { upsert: true, contentType: 'image/png' });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from('qr-codes').getPublicUrl(storagePath);
    const destinationUrl = `${window.location.origin}/${business.slug}`;
    const { data: qrRecord, error: dbError } = await supabase
      .from('qr_codes')
      .upsert({
        business_id: business.id,
        name: `${business.name} QR Menu`,
        code: business.slug,
        qr_image_url: urlData.publicUrl,
        destination_url: destinationUrl,
        encoded_path: encodedPath,
        storage_path: storagePath,
        foreground_color: foregroundColor,
        background_color: backgroundColor,
        is_active: true,
      }, { onConflict: 'code' })
      .select().single();
    if (dbError) throw dbError;
    const saved = qrRecord as QRCode;
    setQrCode(saved);
    return saved;
  }, [business]);

  const isReady = useMemo(() => !authLoading && !loading, [authLoading, loading]);

  const value: ProfileContextType = {
    business, menus, qrCode, loading, error, isReady,
    updateProfile, uploadLogo, uploadMenu, deleteMenu, generateQR, refreshProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextType {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
