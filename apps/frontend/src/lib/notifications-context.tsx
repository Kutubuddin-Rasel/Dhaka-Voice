"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsApi, type Notification } from './api';
import { useAuth } from './auth-context';

type NotificationsContextValue = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archive: (id: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user, mounted } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsApi.list({ page: 1, pageSize: 50 });
      setNotifications(data.items);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message ?? 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const data = await notificationsApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err: unknown) {
      console.error('Failed to load unread count:', err);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, status: 'READ' as const, readAt: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: unknown) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => 
          notification.status === 'UNREAD'
            ? { ...notification, status: 'READ' as const, readAt: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount(0);
    } catch (err: unknown) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const archive = useCallback(async (id: string) => {
    try {
      await notificationsApi.archive(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, status: 'ARCHIVED' as const, archivedAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (err: unknown) {
      console.error('Failed to archive notification:', err);
    }
  }, []);

  // Load notifications when user changes
  useEffect(() => {
    if (mounted && user?.id) {
      loadNotifications();
      refreshUnreadCount();
    } else if (mounted && !user) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [mounted, user, loadNotifications, refreshUnreadCount]);

  // Refresh unread count every 30 seconds
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id, refreshUnreadCount]);

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    archive,
    refreshUnreadCount,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
