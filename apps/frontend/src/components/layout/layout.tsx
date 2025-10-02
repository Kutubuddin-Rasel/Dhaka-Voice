"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './sidebar';
import { Header } from './header';
import { Footer } from './footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user, mounted } = useAuth();

  // Check if current page should hide sidebar (auth pages or when user is not logged in)
  const hideSidebar = pathname.startsWith('/login') || pathname.startsWith('/signup') || !user;

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Always open on desktop
      } else {
        setSidebarOpen(false); // Closed by default on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show loading state until auth is mounted to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  // Don't render sidebar for auth pages or when user is not logged in
  if (hideSidebar) {
    return (
      <div className="flex h-screen bg-background">
        {/* Main Content - Full width when no sidebar */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header - Always show */}
          <Header 
            onMenuClick={toggleSidebar}
            showMenuButton={isMobile}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              
              {/* Footer - Only show on non-auth pages */}
              {!pathname.startsWith('/login') && !pathname.startsWith('/signup') && (
                <Footer />
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop: static, Mobile: fixed overlay */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out",
          isMobile 
            ? "fixed left-0 top-0 z-50 h-full" 
            : "flex-shrink-0"
        )}
      >
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
          isMobile={isMobile}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header 
          onMenuClick={toggleSidebar}
          showMenuButton={isMobile}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            
            {/* Footer - Only show on non-auth pages */}
            {!hideSidebar && (
              <Footer />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
