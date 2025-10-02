"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { authStore } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationsDropdown } from "@/components/ui/notifications-dropdown";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const [user, setUser] = useState(authStore.get().user);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setUser(authStore.get().user);
    setMounted(true);
  }, []);
  
  const isAuthed = mounted && !!user;
  
  const onLogout = () => {
    authStore.clear();
    window.location.href = "/";
  };
  
  const initials = useMemo(() => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(' ');
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  }, [user?.name]);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((v) => !v);
  
  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value.trim();
      router.push(val ? `/complaints?q=${encodeURIComponent(val)}` : '/complaints');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side - Menu button and search */}
        <div className="flex items-center space-x-4">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {isAuthed && (
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search complaints..." 
                  className="pl-10" 
                  onKeyDown={onSearchKey} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-2">
          {!isAuthed ? (
            <>
              <Button variant="outline" asChild>
                <Link href="/complaints">Browse complaints</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          ) : (
            <>
              {/* Notifications */}
              <div className="hidden sm:block">
                <NotificationsDropdown />
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={toggleMenu} 
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold hover:bg-primary/90 transition-colors" 
                  title={user?.name || ''}
                >
                  {initials}
                </button>
                
                {menuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-20">
                      <div className="px-3 py-2 border-b">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <Link 
                        href="/profile" 
                        className="block px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        className="block px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <button 
                        onClick={() => {
                          setMenuOpen(false);
                          onLogout();
                        }} 
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-accent"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
