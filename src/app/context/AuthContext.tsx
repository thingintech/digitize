import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Try optimistic cache load for Auth tables
          const cachedProfile = localStorage.getItem('auth_profile_cache');
          if (cachedProfile) {
            try {
              setProfile(JSON.parse(cachedProfile));
              setLoading(false); // Unblock UI early!
            } catch (e) {
              localStorage.removeItem('auth_profile_cache');
            }
          }
          
          const p = await fetchProfile(initialSession.user.id);
          if (isMounted && p) {
            setProfile(p);
            localStorage.setItem('auth_profile_cache', JSON.stringify(p));
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Safety timeout to prevent infinite auth blocks in case of network drops
    const authSafetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("[AuthContext] Initialization exceeded 4 seconds. Hard unlocking.");
        setLoading(false);
      }
    }, 4000);

    initializeAuth().finally(() => clearTimeout(authSafetyTimeout));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const isBackgroundRefresh = event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED';
        if (!isBackgroundRefresh) setLoading(true); 
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          const p = await fetchProfile(currentSession.user.id);
          if (isMounted && p) {
             setProfile(p);
             localStorage.setItem('auth_profile_cache', JSON.stringify(p));
          }
        }
        
        if (!isBackgroundRefresh) setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        localStorage.removeItem('auth_profile_cache');
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return null;
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
