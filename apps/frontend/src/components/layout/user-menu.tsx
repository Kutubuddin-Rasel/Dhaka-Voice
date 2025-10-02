"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useMemo, useState } from "react";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const initials = useMemo(() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(' ');
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  }, [user?.name]);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold" title={user?.name || ''} aria-haspopup="menu" aria-expanded={open}>
        {initials}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-44 rounded-md border bg-background shadow-md p-1 text-sm">
          <div className="px-3 py-2 text-muted-foreground truncate">{user?.email}</div>
          <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-accent" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/profile" className="block px-3 py-2 rounded hover:bg-accent" onClick={() => setOpen(false)}>Profile</Link>
          <Link href="/settings" className="block px-3 py-2 rounded hover:bg-accent" onClick={() => setOpen(false)}>Settings</Link>
          <button onClick={logout} className="w-full text-left px-3 py-2 rounded hover:bg-accent text-red-600">Logout</button>
        </div>
      )}
    </div>
  );
}


