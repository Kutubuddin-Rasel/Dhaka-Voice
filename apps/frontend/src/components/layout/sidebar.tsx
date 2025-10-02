"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/lib/notifications-context';
import { 
  Home, 
  FileText, 
  Plus, 
  User, 
  Settings, 
  Bell, 
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon: Icon, label, badge, isActive, onClick, isCollapsed }: NavItemProps & { isCollapsed?: boolean }) => (
  <Link href={href} onClick={onClick}>
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        isCollapsed && "justify-center"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="truncate">{label}</span>
          {badge && badge > 0 && (
            <Badge variant="secondary" className="ml-auto h-5 min-w-[20px] text-xs">
              {badge > 99 ? '99+' : badge}
            </Badge>
          )}
        </>
      )}
      {isCollapsed && badge && badge > 0 && (
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </div>
  </Link>
);

const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  isExpanded, 
  onToggle 
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <div className="space-y-1">
    <Button
      variant="ghost"
      onClick={onToggle}
      className="w-full justify-between px-3 py-2.5 h-auto text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        <span>{title}</span>
      </div>
      {isExpanded ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
    {isExpanded && (
      <div className="ml-7 space-y-1">
        {children}
      </div>
    )}
  </div>
);

export default function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const [complaintsExpanded, setComplaintsExpanded] = useState(true);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const { notifications } = useNotifications();

  const isActive = (path: string) => pathname === path;
  
  // Check if user is admin (you can implement proper role checking later)
  const isAdmin = false; // TODO: Implement proper admin role checking
  
  // Get unread notifications count
  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      isActive: isActive('/dashboard')
    }
  ];

  const complaintsItems = [
    {
      href: '/complaints',
      icon: FileText,
      label: 'All Complaints',
      isActive: isActive('/complaints')
    },
    {
      href: '/my-complaints',
      icon: User,
      label: 'My Complaints',
      isActive: isActive('/my-complaints')
    },
    {
      href: '/complaints/new',
      icon: Plus,
      label: 'New Complaint',
      isActive: isActive('/complaints/new')
    }
  ];

  const userItems = [
    {
      href: '/profile',
      icon: User,
      label: 'Profile',
      isActive: isActive('/profile')
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Settings',
      isActive: isActive('/settings')
    }
  ];

  const adminItems = [
    {
      href: '/admin/analytics',
      icon: BarChart3,
      label: 'Analytics',
      isActive: isActive('/admin/analytics')
    },
    {
      href: '/admin/users',
      icon: Shield,
      label: 'User Management',
      isActive: isActive('/admin/users')
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "h-full bg-background border-r transition-all duration-300 ease-in-out",
          isMobile
            ? "fixed left-0 top-0 z-50"
            : "relative",
          isMobile
            ? isOpen
              ? "translate-x-0 w-80"
              : "-translate-x-full w-80"
            : isOpen
            ? "w-80"
            : "w-16"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            {isOpen && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">DV</span>
                </div>
                <span className="font-semibold text-lg">DhakaVoice</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="ml-auto"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  onClick={isMobile ? onToggle : undefined}
                  isCollapsed={!isOpen}
                />
              ))}
            </div>

            {/* Complaints Section */}
            {isOpen ? (
              <CollapsibleSection
                title="Complaints"
                icon={FileText}
                isExpanded={complaintsExpanded}
                onToggle={() => setComplaintsExpanded(!complaintsExpanded)}
              >
                {complaintsItems.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    onClick={isMobile ? onToggle : undefined}
                    isCollapsed={false}
                  />
                ))}
              </CollapsibleSection>
            ) : (
              <div className="space-y-1">
                {complaintsItems.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    onClick={isMobile ? onToggle : undefined}
                    isCollapsed={true}
                  />
                ))}
              </div>
            )}

            {/* User Section */}
            <div className="space-y-1">
              {userItems.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  onClick={isMobile ? onToggle : undefined}
                  isCollapsed={!isOpen}
                />
              ))}
            </div>

            {/* Notifications */}
            <NavItem
              href="/notifications"
              icon={Bell}
              label="Notifications"
              badge={unreadCount > 0 ? unreadCount : undefined}
              isActive={isActive('/notifications')}
              onClick={isMobile ? onToggle : undefined}
              isCollapsed={!isOpen}
            />

            {/* Admin Section - Only show for admin users */}
            {isAdmin && (
              isOpen ? (
                <CollapsibleSection
                  title="Administration"
                  icon={Shield}
                  isExpanded={adminExpanded}
                  onToggle={() => setAdminExpanded(!adminExpanded)}
                >
                  {adminItems.map((item) => (
                    <NavItem
                      key={item.href}
                      {...item}
                      onClick={isMobile ? onToggle : undefined}
                      isCollapsed={false}
                    />
                  ))}
                </CollapsibleSection>
              ) : (
                <div className="space-y-1">
                  {adminItems.map((item) => (
                    <NavItem
                      key={item.href}
                      {...item}
                      onClick={isMobile ? onToggle : undefined}
                      isCollapsed={true}
                    />
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer */}
          {isOpen && (
            <div className="p-4 border-t">
              <div className="text-xs text-muted-foreground text-center">
                DhakaVoice v1.0
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
