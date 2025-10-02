"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { type AuthUser, authApi } from '@/lib/api';
import { authStore } from '@/lib/auth';

type AuthContextValue = {
  user: AuthUser | null;
  mounted: boolean;
  setUser: (u: AuthUser | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(authStore.get().user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Attempt refresh to ensure cookies/session are valid
    (async () => {
      try {
        await authApi.refresh();
      } catch {
        authStore.clear();
        setUser(null);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    mounted,
    setUser: (u) => {
      setUser(u);
      if (u) authStore.set({ user: u }); else authStore.clear();
    },
    logout: async () => {
      try { await authApi.logout(); } catch {}
      authStore.clear();
      setUser(null);
      if (typeof window !== 'undefined') window.location.href = '/';
    },
  }), [user, mounted]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


