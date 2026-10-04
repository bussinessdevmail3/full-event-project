import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      return;
    }

    if (data) {
      setProfile(data as Profile);
    } else {
      // Create profile if it doesn't exist
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const newProfile = {
          id: uid,
          email: userData.user.email || '',
          full_name: userData.user.user_metadata?.full_name || '',
          phone: userData.user.user_metadata?.phone || '',
          role: 'customer' as const,
          preferred_language: 'he' as const,
        };
        const { data: created } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .maybeSingle();

        if (created) {
          setProfile(created as Profile);
        }
      }
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        loadProfile(initialSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        (async () => {
          await loadProfile(newSession.user.id);
        })();
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone || '' },
      },
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone: phone || null,
        role: 'customer',
        preferred_language: 'he',
      });

      if (profileError && !profileError.message.includes('duplicate')) {
        // Profile creation failed, but auth succeeded — not critical
      }
    }

    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: mapAuthError(error.message) };
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return { error: mapAuthError(error.message) };
    }
    return { error: null };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      return { error: error.message };
    }

    await refreshProfile();
    return { error: null };
  }, [user, refreshProfile]);

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signUp, signIn, signOut, resetPassword, refreshProfile, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

function mapAuthError(message: string): string {
  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'auth.errorEmailInUse';
  }
  if (message.includes('Invalid login') || message.includes('invalid credentials')) {
    return 'auth.errorInvalidCredentials';
  }
  if (message.includes('Password should be') || message.includes('weak')) {
    return 'auth.errorWeakPassword';
  }
  if (message.includes('rate limit')) {
    return 'auth.errorNetwork';
  }
  return 'auth.errorGeneric';
}
