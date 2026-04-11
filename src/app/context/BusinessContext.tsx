import React, {
  createContext,
  useContext,
  useMemo,
} from 'react';
import { useProfile, Business, QRCode } from './ProfileContext';

/**
 * BusinessContext (Lightweight Consumer)
 * 
 * Provides a business-specific view of the profile data.
 * No longer fetches data independently to avoid redundant hanging queries.
 */

export interface Subscription {
  id: string;
  business_id: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'trialing' | 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_end: string | null;
}

export interface BusinessContextType {
  business: Business | null;
  subscription: Subscription | null; // Note: Currently placeholder until Stripe integrated
  qrCodes: QRCode[];
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  lifecycle: string;
  refetch: () => Promise<void>;
  updateBusiness: (data: Partial<Business>) => Promise<void>;
  generateQR: (options?: any) => Promise<QRCode | null>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { 
    business, 
    qrCode, 
    loading: profileLoading, 
    error: profileError, 
    isReady, 
    lifecycle,
    refreshProfile,  
    updateProfile, 
    generateQR: profileGenerateQR 
  } = useProfile();

  // Unified business context data
  const value = useMemo(() => ({
    business,
    subscription: null, // Subscriptions logic moved to SQL trigger; exposed here if needed
    qrCodes: qrCode ? [qrCode] : [],
    isLoading: profileLoading,
    error: profileError,
    isReady: isReady,
    lifecycle,
    refetch: refreshProfile,
    updateBusiness: (data: any) => updateProfile(data),
    generateQR: profileGenerateQR,
  }), [business, qrCode, profileLoading, profileError, isReady, lifecycle, refreshProfile, updateProfile, profileGenerateQR]);

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}

