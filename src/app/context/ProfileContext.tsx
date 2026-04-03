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
  qr_size?: number;
  qr_style?: string;
  qr_frame?: string;
  logo_url?: string | null;
  logo_size?: number;
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

export type ProfileLifecycle = 'idle' | 'booting' | 'syncing' | 'ready' | 'degraded' | 'error';

interface ProfileContextType {
  business: Business | null;
  menus: BusinessMenu[];
  qrCode: QRCode | null;
  loading: boolean;
  error: string | null;
  isReady: boolean;
  lifecycle: ProfileLifecycle;

  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
  uploadLogo: (file: File) => Promise<string | null>;
  uploadMenu: (file: File, label: string) => Promise<BusinessMenu | null>;
  deleteMenu: (menuId: string, storagePath: string) => Promise<void>;
  generateQR: (options?: { foregroundColor?: string; backgroundColor?: string; size?: number; style?: 'square' | 'rounded' | 'dots'; logoUrl?: string; logoSize?: number; frame?: string }) => Promise<QRCode | null>;
  refreshProfile: () => Promise<void>;

  // --- Strict Generic Profile API Compat (For Generic Callers) ---
  user: any;
  authLoading: boolean;
  profile: Business | null; // Profile is synonymous with Business in this architecture
  profileLoading: boolean;
  isProfileComplete: boolean;
  missingFields: string[];
  signOut: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCookie(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
  } catch {
    // Ignore malformed cookies
  }
  return null;
}

function setCookie(name: string, value: string, days: number = 7) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/;SameSite=Lax";
}

function eraseCookie(name: string) {
  document.cookie = name + '=; Max-Age=-99999999; path=/';
}

function checkCompleteness(biz: Business | null): { complete: boolean, missing: string[] } {
  if (!biz) return { complete: false, missing: ['business'] };
  const missing: string[] = [];
  if (!biz.name) missing.push('name');
  if (!biz.slug) missing.push('slug');
  // Consider them strictly incomplete if they haven't set basic brand identity
  // if (!biz.logo_url) missing.push('logo_url');
  
  return {
    complete: missing.length === 0,
    missing
  };
}

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
  const { user, loading: authLoading, signOut: authSignOut } = useAuth();

  const [lifecycle, setLifecycle] = useState<ProfileLifecycle>('idle');
  const [business, setBusiness] = useState<Business | null>(null);
  const [menus, setMenus] = useState<BusinessMenu[]>([]);
  const [qrCode, setQrCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from cache immediately to prevent blank remounts
  useEffect(() => {
    setLifecycle('booting');
    console.log('[lifecycle] idle → booting');
    try {
      const cached = getCookie('app_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Validating strict requirements to avoid garbage data
        const completeness = checkCompleteness(parsed);
        if (completeness.complete) {
           setBusiness(parsed);
           setLoading(false); // Can instantly render UI off cache
        }
      }
    } catch(e) {
      // Ignored
    }
  }, []);

  // Wrapper to aggressively unstick hanging Supabase queries (usually caused by infinite RLS recursion on the DB)
  const withTimeout = async <T,>(promise: Promise<T>, label: string, ms = 8000): Promise<T> => {
    let timeoutId: any;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`Database query timed out securely on [${label}]. (Check your Supabase RLS policies for an infinite recursion loop freezing PostgREST)`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
  };

  const loadAll = useCallback(async (userId: string, isRetry = false, isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
      setLifecycle(prev => {
        console.log(`[lifecycle] ${prev} → syncing`);
        return 'syncing';
      });
    }
    if (!isBackground) setError(null);
    try {
      // 1. Find business membership (Wrapped with timeout to prevent ghost hangs)
      const { data: memberData, error: memberError } = await withTimeout(
        supabase
          .from('business_members')
          .select('business_id')
          .eq('user_id', userId)
          .maybeSingle() as unknown as Promise<any>,
        'business_members'
      );

      if (memberError) throw memberError;

      // 1b. If no business found, but we are inside a new session, try one more time
      // This handles the small delay in DB triggers during registration
      if (!memberData) {
        if (!isRetry) {
          console.log('[ProfileContext] No business found, retrying in 1.5s...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          await loadAll(userId, true, isBackground);
          return;
        }
        setBusiness(null);
        setMenus([]);
        setQrCode(null);
        setLifecycle(prev => {
          console.log(`[lifecycle] ${prev} → ready (no business yet)`);
          return 'ready';
        });
        return; // finally block sets loading=false natively
      }

      const businessId = memberData.business_id;

      // 2. Parallel fetch of all business resources
      const [bizRes, menusRes, qrRes] = await withTimeout(Promise.all([
        supabase.from('businesses').select('*').eq('id', businessId).single(),
        supabase.from('business_menus').select('*').eq('business_id', businessId).order('sort_order', { ascending: true }),
        supabase.from('qr_codes').select('*').eq('business_id', businessId).eq('is_active', true).maybeSingle(),
      ]) as unknown as Promise<any>, 'Promise.all (businesses, business_menus, qr_codes)');

      if (bizRes.error) throw bizRes.error;
      const fetchedBiz = bizRes.data as Business;
      setBusiness(fetchedBiz);
      setCookie('app_profile', JSON.stringify(fetchedBiz));
      
      setMenus((menusRes.data ?? []) as BusinessMenu[]);
      setQrCode(qrRes.data as QRCode | null);
      
      setLifecycle(prev => {
        console.log(`[lifecycle] ${prev} → ready`);
        return 'ready';
      });
    } catch (err: any) {
      setError(err.message || 'Failed to sync business data');
      console.error('[ProfileContext] bootstrap error:', err);
      setLifecycle(prev => {
        console.log(`[lifecycle] ${prev} → error`);
        return 'error';
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 3s safety timeout to prevent infinite auth blocks
    let forceUnblockTimeout: any;
    if (authLoading) {
       forceUnblockTimeout = setTimeout(() => {
         console.warn("[ProfileContext] authLoading hung, unlocking context.");
         if (loading) setLoading(false);
       }, 3000);
       return () => clearTimeout(forceUnblockTimeout);
    }
    
    if (user) {
      // If we already have the business for this user, it's a background refresh (e.g. from token refresh)
      const isBackgroundRefresh = business !== null;
      loadAll(user.id, false, isBackgroundRefresh);
    } else {
      setBusiness(null);
      eraseCookie('app_profile');
      setMenus([]);
      setQrCode(null);
      if (lifecycle !== 'idle' && lifecycle !== 'booting') {
         setLifecycle(prev => {
           console.log(`[lifecycle] ${prev} → degraded`);
           return 'degraded';
         });
      }
      setLoading(false);
    }
  }, [user, authLoading, loadAll]); // Removed `business` from dependency intentionally to avoid infinite loop on background updates

  const refreshProfile = useCallback(async () => {
    if (user) {
      const isBackgroundRefresh = business !== null;
      await loadAll(user.id, false, isBackgroundRefresh);
    }
  }, [user, loadAll, business]);

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
    
    const nextBiz = { ...business, ...data, slug };
    setBusiness(nextBiz);
    setCookie('app_profile', JSON.stringify(nextBiz));
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

  const generateQR = useCallback(async (options: { foregroundColor?: string; backgroundColor?: string; size?: number; style?: 'square' | 'rounded' | 'dots'; logoUrl?: string; logoSize?: number; frame?: string } = {}): Promise<QRCode | null> => {
    if (!business) throw new Error('No business found');
    const { foregroundColor = '#0f172a', backgroundColor = '#ffffff', size = 512, style = 'square', logoUrl, logoSize = 40, frame = 'none' } = options;
    const encodedPath = `/${business.slug}`;
    const storagePath = `${business.id}.png`;
    const result = await generateQRImage(encodedPath, { foregroundColor, backgroundColor, width: size, style, logoUrl, logoSize });
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
        qr_size: size,
        qr_style: style,
        qr_frame: frame,
        logo_url: logoUrl,
        logo_size: logoSize,
        is_active: true,
      }, { onConflict: 'code' })
      .select().single();
    if (dbError) throw dbError;
    const saved = qrRecord as QRCode;
    setQrCode(saved);
    return saved;
  }, [business]);

  const signOut = useCallback(async () => {
    setLifecycle('idle');
    eraseCookie('app_profile');
    setBusiness(null);
    await authSignOut();
  }, [authSignOut]);

  // Unified single condition: The app is definitively "Ready" when auth stops loading,
  // AND either we don't have a user (guest mode), or if we DO have a user, ProfileContext is done loading their data.
  const isReady = useMemo(() => {
    if (authLoading) return false;
    if (user && loading) return false;
    return true;
  }, [authLoading, user, loading]);

  const completeness = checkCompleteness(business);

  const value: ProfileContextType = {
    business, menus, qrCode, loading, error, isReady, lifecycle,
    updateProfile, uploadLogo, uploadMenu, deleteMenu, generateQR, refreshProfile,
    
    // Generic Profile Compliance API Extension
    user,
    authLoading,
    profile: business,
    profileLoading: loading,
    isProfileComplete: completeness.complete,
    missingFields: completeness.missing,
    signOut
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextType {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
