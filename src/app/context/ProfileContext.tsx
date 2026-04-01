/**
 * ProfileContext.tsx
 *
 * Provides the logged-in user's business profile, uploaded menus,
 * generated QR code, and all actions needed by the QR service flow.
 *
 * FUTURE-PROOF QR DOMAIN STRATEGY
 * ────────────────────────────────
 * The QR image encodes the path "/{slug}" — never a full URL.
 * Even if the domain changes (myapp.com → newapp.com), the
 * printed QR image still works because the actual domain is
 * resolved at runtime via window.location.origin.
 *
 * See: src/services/qrService.ts for the generation logic.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from './AuthContext';
import { generateQRImage, QRGenerateResult } from '../services/qrService';
import { toast } from 'sonner';

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
  encoded_path: string | null;   // e.g. "/my-cafe" — what's inside the PNG
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
  isInitialLoad: boolean;
  error: string | null;

  /** Upserts (partial) business profile fields. */
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;

  /** Uploads a logo file to Storage and updates business.logo_url. */
  uploadLogo: (file: File) => Promise<string | null>;

  /** Uploads a menu file to Storage, saves record to business_menus. */
  uploadMenu: (file: File, label: string) => Promise<BusinessMenu | null>;

  /** Deletes a menu record and its Storage file. */
  deleteMenu: (menuId: string, storagePath: string) => Promise<void>;

  /**
   * Generates a QR code image and saves it to Supabase.
   *
   * The image encodes ONLY "/{slug}" — not a full URL.
   * This means the QR never breaks if the domain changes.
   * We overwrite the same Storage path each time so the
   * public URL never changes (no reprint needed).
   */
  generateQR: (options?: { foregroundColor?: string; backgroundColor?: string }) => Promise<QRCode | null>;

  /** Re-fetches all profile data. */
  refreshProfile: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a business name to a URL-safe slug. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Ensures slug uniqueness by appending a short random suffix if needed. */
async function ensureUniqueSlug(base: string, currentId?: string): Promise<string> {
  let candidate = base;
  let attempt = 0;
  while (true) {
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();

    if (!data || data.id === currentId) return candidate; // available or it's our own
    attempt++;
    candidate = `${base}-${Math.floor(Math.random() * 9000) + 1000}`;
    if (attempt > 10) return `${base}-${Date.now()}`; // safety fallback
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [menus, setMenus] = useState<BusinessMenu[]>([]);
  const [qrCode, setQrCode] = useState<QRCode | null>(null);
  const [loading, setLoading] = useState(!!user); // Start loading if user exists
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetchers ──────────────────────────────────────────────────────────────

  const fetchBusiness = useCallback(async (userId: string) => {
    // Find the business the user is an owner/member of
    const { data: memberData, error: memberError } = await supabase
      .from('business_members')
      .select('business_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (memberError) throw memberError;
    if (!memberData?.business_id) return null;

    const { data: biz, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', memberData.business_id)
      .single();

    if (bizError) throw bizError;
    return biz as Business;
  }, []);

  const fetchMenus = useCallback(async (businessId: string) => {
    const { data, error } = await supabase
      .from('business_menus')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data ?? []) as BusinessMenu[];
  }, []);

  const fetchQRCode = useCallback(async (businessId: string) => {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as QRCode | null;
  }, []);

  const loadAll = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const biz = await fetchBusiness(userId);
      setBusiness(biz);

      if (biz) {
        const [menuList, qr] = await Promise.all([
          fetchMenus(biz.id).catch(() => []),
          fetchQRCode(biz.id).catch(() => null),
        ]);
        setMenus(menuList);
        setQrCode(qr);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      console.error('[ProfileContext] loadAll error:', err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [fetchBusiness, fetchMenus, fetchQRCode]);

  // ── Auth change listener ───────────────────────────────────────────────────

  useEffect(() => {
    if (user) {
      loadAll(user.id);
    } else {
      setBusiness(null);
      setMenus([]);
      setQrCode(null);
      setLoading(false);
    }
  }, [user, loadAll]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const refreshProfile = useCallback(async () => {
    if (user) await loadAll(user.id);
  }, [user, loadAll]);

  const updateProfile = useCallback(async (data: UpdateProfilePayload) => {
    if (!business) throw new Error('No business found');

    // Auto-generate slug from business name if name is being updated
    let slug = business.slug;
    if (data.name && data.name !== business.name) {
      const base = slugify(data.name);
      slug = await ensureUniqueSlug(base, business.id);
    }

    const { error } = await supabase
      .from('businesses')
      .update({ ...data, slug, updated_at: new Date().toISOString() })
      .eq('id', business.id);

    if (error) throw error;

    // Update local state optimistically
    setBusiness(prev => prev ? { ...prev, ...data, slug } : prev);
  }, [business]);

  const uploadLogo = useCallback(async (file: File): Promise<string | null> => {
    if (!business) throw new Error('No business found');

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    const storagePath = `${business.id}/logo.${ext}`;

    // 1. Upload to logos bucket
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(storagePath, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(storagePath);
    
    const publicUrl = urlData.publicUrl;

    // 3. Update business record
    const { error: dbError } = await supabase
      .from('businesses')
      .update({ logo_url: publicUrl })
      .eq('id', business.id);

    if (dbError) throw dbError;

    setBusiness(prev => prev ? { ...prev, logo_url: publicUrl } : prev);
    return publicUrl;
  }, [business]);

  const uploadMenu = useCallback(async (
    file: File,
    label: string,
  ): Promise<BusinessMenu | null> => {
    if (!business) throw new Error('No business found');

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const fileType: 'pdf' | 'image' = ext === 'pdf' ? 'pdf' : 'image';
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    const storagePath = `${business.id}/${uniqueName}`;

    // 1. Upload to Supabase Storage bucket "menus"
    const { error: uploadError } = await supabase.storage
      .from('menus')
      .upload(storagePath, file, { upsert: false, contentType: file.type });

    if (uploadError) throw uploadError;

    // 2. Get the public URL (bucket must be set to public, or use signed URLs)
    const { data: urlData } = supabase.storage
      .from('menus')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // 3. Save record to business_menus table
    const { data: menuRecord, error: dbError } = await supabase
      .from('business_menus')
      .insert({
        business_id: business.id,
        label,
        file_type: fileType,
        storage_path: storagePath,
        public_url: publicUrl,
        is_active: true,
        sort_order: menus.length,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    const newMenu = menuRecord as BusinessMenu;
    setMenus(prev => [...prev, newMenu]);
    return newMenu;
  }, [business, menus.length]);

  const deleteMenu = useCallback(async (menuId: string, storagePath: string) => {
    // Delete from storage
    await supabase.storage.from('menus').remove([storagePath]);

    // Delete from DB
    const { error } = await supabase
      .from('business_menus')
      .delete()
      .eq('id', menuId);

    if (error) throw error;
    setMenus(prev => prev.filter(m => m.id !== menuId));
  }, []);

  const generateQR = useCallback(async (
    options: { foregroundColor?: string; backgroundColor?: string } = {}
  ): Promise<QRCode | null> => {
    if (!business) throw new Error('No business found');

    const { foregroundColor = '#0f172a', backgroundColor = '#ffffff' } = options;

    // ─── FUTURE-PROOF QR LOGIC ─────────────────────────────────────
    // We encode ONLY the path: "/{slug}" — never a full URL.
    //
    // When the QR is scanned, the phone's camera opens the default
    // browser at whatever URL the app is currently hosted on,
    // then appends "/{slug}" as the path — matching our route.
    //
    // Because the domain is NOT in the PNG:
    //  • myapp.com → newapp.com migration: QR still works ✅
    //  • Custom domain added: QR still works ✅
    //  • No customer reprints needed ever ✅
    // ───────────────────────────────────────────────────────────────
    const encodedPath = `/${business.slug}`;
    const storagePath = `${business.id}.png`; // fixed path → overwrite = same URL

    // Generate the QR image (returns a Blob)
    let result: QRGenerateResult;
    try {
      result = await generateQRImage(encodedPath, { foregroundColor, backgroundColor });
    } catch (err) {
      toast.error('Failed to generate QR code image');
      throw err;
    }

    // Upload / overwrite to "qr-codes" Storage bucket
    const { error: uploadError } = await supabase.storage
      .from('qr-codes')
      .upload(storagePath, result.blob, {
        upsert: true,           // overwrite: same path = same public URL
        contentType: 'image/png',
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('qr-codes')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Build the human-readable destination URL (for display only, NOT in the QR image)
    // This uses window.location.origin so it always reflects the current domain.
    const destinationUrl = `${window.location.origin}/${business.slug}`;

    // Upsert the qr_codes record (one active QR per business)
    const qrName = `${business.name} QR Menu`;
    const qrCode = business.slug; // unique code = slug

    const { data: qrRecord, error: dbError } = await supabase
      .from('qr_codes')
      .upsert(
        {
          business_id: business.id,
          name: qrName,
          code: qrCode,
          qr_image_url: publicUrl,
          destination_url: destinationUrl,
          encoded_path: encodedPath,
          storage_path: storagePath,
          foreground_color: foregroundColor,
          background_color: backgroundColor,
          is_active: true,
        },
        { onConflict: 'code' }
      )
      .select()
      .single();

    if (dbError) throw dbError;

    const saved = qrRecord as QRCode;
    setQrCode(saved);
    return saved;
  }, [business]);

  // ── Context value ─────────────────────────────────────────────────────────

  const value: ProfileContextType = {
    business,
    menus,
    qrCode,
    loading,
    isInitialLoad,
    error,
    updateProfile,
    uploadLogo,
    uploadMenu,
    deleteMenu,
    generateQR,
    refreshProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProfile(): ProfileContextType {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a <ProfileProvider>');
  return ctx;
}
