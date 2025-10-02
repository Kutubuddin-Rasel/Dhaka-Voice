"use client";
import { authApi, type AuthUser } from "./api";

type AuthState = {
  user: AuthUser | null;
};

const AUTH_KEY = "dhakavoice:user";

export const authStore = {
  get(): AuthState {
    if (typeof window === 'undefined') return { user: null };
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : { user: null };
    } catch {
      return { user: null };
    }
  },
  set(state: AuthState) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
  },
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_KEY);
  }
};

export async function refreshSession() {
  try {
    await authApi.refresh();
    // We rely on cookie for auth; user info will be set on login/signup only for now
  } catch {
    authStore.clear();
  }
}

export function getNextParam(): string | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  return url.searchParams.get('next');
}

