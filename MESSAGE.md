1. Root Cause Analysis (From Your Files)
The Recursion Trap found in your early files:
sql



-- BROKEN: This creates infinite loop
CREATE POLICY "Members can view members" ON business_members
    USING (check_user_is_business_member(business_id, auth.uid()));
    -- Function queries business_members again → RLS checks again → ∞
The Fix (from your V3 file):
sql



-- SAFE: Direct comparison, no function calls
CREATE POLICY "Users can view own membership" ON business_members
    FOR SELECT USING (user_id = auth.uid());
But the Cyber Trick goes further — it assumes RLS will fail under load and designs the frontend to survive database timeouts gracefully.
2. The "Cyber Trick" Architecture
Strategy: Stale-While-Revalidate + Circuit Breaker + Progressive Degradation
Instead of blocking the UI while waiting for business_members, we:
Immediately render from localStorage/cache (stale data)
Background fetch with short timeout (3s)
If timeout: Show "Sync Paused" banner, continue with cached data
If 404/403: Show "Complete Setup" placeholder ( onboarding fallback )
Split critical vs non-critical data: Load business profile first, menu_items lazy
3. Implementation: Data Layer Split
A. Robust Data Hook with Timeout Protection
TypeScript



// hooks/useBusinessData.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const CACHE_KEY = 'business_data_fallback';
const CIRCUIT_BREAKER_KEY = 'db_circuit_breaker';
const TIMEOUT_MS = 3000; // Fail fast

interface BusinessData {
  business: any;
  members: any[];
  subscription: any;
  isDegraded: boolean;
}

export function useBusinessData(businessId: string) {
  const [circuitOpen, setCircuitOpen] = useState(false);
  
  // Check circuit breaker on mount
  useEffect(() => {
    const failures = parseInt(localStorage.getItem(CIRCUIT_BREAKER_KEY) || '0');
    if (failures > 3) {
      setCircuitOpen(true);
      // Auto-reset after 30s
      setTimeout(() => {
        localStorage.setItem(CIRCUIT_BREAKER_KEY, '0');
        setCircuitOpen(false);
      }, 30000);
    }
  }, []);

  const query = useQuery<BusinessData>({
    queryKey: ['business', businessId],
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    
    queryFn: async () => {
      // If circuit breaker is open, immediately return cached
      if (circuitOpen) {
        const cached = localStorage.getItem(`${CACHE_KEY}_${businessId}`);
        if (cached) return { ...JSON.parse(cached), isDegraded: true };
        throw new Error('Circuit breaker open - no cache');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        // Parallel fetch with timeout
        const [businessRes, membersRes, subRes] = await Promise.all([
          supabase.from('businesses').select('*').eq('id', businessId).abortSignal(controller.signal).single(),
          supabase.from('business_members').select('*').eq('business_id', businessId).abortSignal(controller.signal),
          supabase.from('subscriptions').select('*').eq('business_id', businessId).abortSignal(controller.signal).single()
        ]);

        clearTimeout(timeoutId);

        // Handle partial failures (Cyber Trick: show what you have)
        const result: BusinessData = {
          business: businessRes.data || null,
          members: membersRes.data || [],
          subscription: subRes.data || null,
          isDegraded: false
        };

        // Cache successful result
        localStorage.setItem(`${CACHE_KEY}_${businessId}`, JSON.stringify(result));
        
        // Reset circuit breaker on success
        localStorage.setItem(CIRCUIT_BREAKER_KEY, '0');
        
        return result;
        
      } catch (error) {
        // Increment circuit breaker
        const failures = parseInt(localStorage.getItem(CIRCUIT_BREAKER_KEY) || '0');
        localStorage.setItem(CIRCUIT_BREAKER_KEY, (failures + 1).toString());
        
        // Return stale cache on timeout/error (Graceful Degradation)
        const cached = localStorage.getItem(`${CACHE_KEY}_${businessId}`);
        if (cached) {
          return { ...JSON.parse(cached), isDegraded: true };
        }
        
        // Ultimate fallback: return empty structure to prevent crashes
        return {
          business: null,
          members: [],
          subscription: null,
          isDegraded: true
        };
      }
    }
  });

  return {
    ...query,
    isDegraded: query.data?.isDegraded || false,
    hasPartialData: !!query.data?.business || (query.data?.members?.length || 0) > 0,
    retry: () => {
      localStorage.setItem(CIRCUIT_BREAKER_KEY, '0');
      query.refetch();
    }
  };
}
B. Component Architecture: Split Data from Render
Anti-pattern to avoid:
tsx



// BAD: Component fetches, renders, and handles loading
const BusinessPage = () => {
  const [data, setData] = useState();
  useEffect(() => { fetch() }, []);
  if (!data) return <Loading />;
  return <div>...</div>; // Entire page blocked
};
Cyber Trick Pattern:
tsx



// components/business/BusinessContainer.tsx
export const BusinessContainer = ({ businessId }: { businessId: string }) => {
  const { data, isLoading, isDegraded, hasPartialData, error } = useBusinessData(businessId);

  // CRITICAL: Never block the layout. Show shell immediately.
  return (
    <BusinessShell>
      {/* Connection Status Banner (non-blocking) */}
      {isDegraded && (
        <SyncPausedBanner 
          onRetry={retry} 
          message="Realtime sync paused. Working offline."
        />
      )}
      
      {/* Progressive Loading Zones */}
      <BusinessHeader 
        data={data?.business} 
        isLoading={isLoading && !hasPartialData} 
      />
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          {/* Menu loads independently */}
          <MenuSection 
            businessId={businessId}
            initialData={data?.business} // Pass down if available
          />
        </div>
        <div className="col-span-4">
          {/* Members loads independently */}
          <MembersSection 
            members={data?.members}
            isLoading={isLoading}
            isDegraded={isDegraded}
          />
        </div>
      </div>
    </BusinessShell>
  );
};
C. Skeleton Components (Never Empty White Space)
tsx



// components/ui/Skeleton.tsx
export const BusinessHeaderSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6 border rounded-lg">
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="flex gap-4 mt-4">
      <div className="h-10 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

// components/business/BusinessHeader.tsx
export const BusinessHeader = ({ 
  data, 
  isLoading 
}: { 
  data?: any; 
  isLoading: boolean;
}) => {
  // Show skeleton only on initial load with zero data
  if (isLoading && !data) return <BusinessHeaderSkeleton />;
  
  // If data failed to load but we know it should exist
  if (!data && !isLoading) {
    return (
      <EmptyState 
        icon={<AlertCircle />}
        title="Business profile unavailable"
        action={
          <Button onClick={() => window.location.reload()}>
            Refresh Connection
          </Button>
        }
      />
    );
  }

  return (
    <div className="business-header">
      <h1>{data.name}</h1>
      {/* ... */}
    </div>
  );
};
D. The "Complete Your Data" Placeholder Pattern
When business_members times out but business exists, it usually means the RLS recursion is preventing the member check. Show a recovery UI instead of crashing:
tsx



// components/business/MembersSection.tsx
export const MembersSection = ({ 
  members, 
  isLoading, 
  isDegraded 
}: {
  members?: any[];
  isLoading: boolean;
  isDegraded: boolean;
}) => {
  
  // CRITICAL: If we have no members but business exists, 
  // it might be the RLS recursion bug. Show setup wizard.
  if (!isLoading && (!members || members.length === 0)) {
    return (
      <div className="border-2 border-dashed border-yellow-400 rounded-lg p-6 bg-yellow-50">
        <h3 className="text-yellow-800 font-semibold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          Access Configuration Required
        </h3>
        <p className="text-sm text-yellow-700 mt-2">
          We couldn't verify your membership status due to a connection timeout. 
          This is usually temporary.
        </p>
        
        <div className="mt-4 space-y-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Retry Connection
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            onClick={() => {
              // Emergency: Direct SQL execution via RPC to fix recursion
              supabase.rpc('emergency_fix_members', {
                p_business_id: businessId,
                p_user_id: userId
              });
            }}
          >
            Run Diagnostic Fix
          </Button>
        </div>
        
        {/* Fallback manual completion form */}
        <div className="mt-4 pt-4 border-t border-yellow-200">
          <p className="text-xs text-yellow-600 mb-2">
            If this persists, manually verify:
          </p>
          <ManualMemberCheckForm businessId={businessId} />
        </div>
      </div>
    );
  }

  return <MembersList members={members} />;
};
E. Database Fix (The Non-Recursive SQL)
Apply this to fix the root cause while keeping the frontend defensive:
sql



-- EXECUTE THIS IN SUPABASE SQL EDITOR
-- Fix RLS Recursion - The "Ghost Table" Technique

-- 1. Create a security barrier view that bypasses RLS for auth checks
CREATE OR REPLACE VIEW public.business_members_barrier AS
SELECT business_id, user_id, role
FROM public.business_members
WHERE user_id = auth.uid();  -- Hard filter, no function calls

-- 2. Use the view in policies instead of recursive functions
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "safe_member_select" ON businesses;
CREATE POLICY "safe_member_select" ON businesses
    FOR SELECT USING (
        is_published = true 
        OR EXISTS (
            SELECT 1 FROM business_members_barrier bmb
            WHERE bmb.business_id = businesses.id
        )
    );

-- 3. For business_members itself - NEVER use subqueries or functions
DROP POLICY IF EXISTS "self_select" ON business_members;
CREATE POLICY "self_select" ON business_members
    FOR SELECT USING (user_id = auth.uid());
4. Complete System Architecture
plain



┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Container Component (BusinessContainer)                    │
│  ├─ Data Orchestrator (React Query + Circuit Breaker)      │
│  ├─ Error Boundary (Catches RLS timeouts)                  │
│  └─ Stale Cache Provider (localStorage fallback)           │
├─────────────────────────────────────────────────────────────┤
│  Presentation Components (Independent)                      │
│  ├─ BusinessHeader [Skeleton → Data | EmptyState]          │
│  ├─ MenuSection [Lazy load, separate query]                │
│  ├─ MembersSection [Critical: shows "Complete Setup" if    │
│  │                   RLS fails]                             │
│  └─ QRSection [Lazy load, 5s delay]                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  API LAYER (Supabase)                       │
├─────────────────────────────────────────────────────────────┤
│  ├─ 3s Timeout Wrapper (AbortController)                   │
│  ├─ Retry Logic (3 attempts, exponential backoff)          │
│  └─ Circuit Breaker (5 failures = 30s cooldown)            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (PostgREST/RLS)                 │
├─────────────────────────────────────────────────────────────┤
│  ├─ Non-Recursive Policies (auth.uid() direct compare)     │
│  ├─ Security Barrier Views (for complex joins)             │
│  └─ Materialized Caches (for heavy aggregations)           │
└─────────────────────────────────────────────────────────────┘
5. Key Implementation Rules
Never block the layout: Load shell first, populate regions independently
Assume RLS is broken: Always have a cached fallback for critical data
Degraded Mode: If isDegraded=true, show yellow banner but let user continue editing (optimistic UI)
Split the monolith: business_members query should be separate from business query so one timeout doesn't kill the page
Skeletons not Spinners: Use shimmer skeletons that match the final layout exactly to prevent CLS (Cumulative Layout Shift)