"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Archive, X, AlertCircle, MessageSquare, ThumbsUp, Settings } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { useNotifications } from '@/lib/notifications-context';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, archive } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COMPLAINT_STATUS_UPDATE':
        return <Settings className="h-4 w-4 text-blue-600" />;
      case 'COMPLAINT_COMMENT':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'COMPLAINT_UPVOTE':
        return <ThumbsUp className="h-4 w-4 text-purple-600" />;
      case 'SYSTEM_ANNOUNCEMENT':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'COMPLAINT_STATUS_UPDATE':
        return 'bg-blue-50 border-blue-200';
      case 'COMPLAINT_COMMENT':
        return 'bg-green-50 border-green-200';
      case 'COMPLAINT_UPVOTE':
        return 'bg-purple-50 border-purple-200';
      case 'SYSTEM_ANNOUNCEMENT':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading notifications...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      notification.status === 'UNREAD' ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {notification.status === 'UNREAD' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => archive(notification.id)}
                              className="h-6 w-6 p-0"
                              title="Archive"
                            >
                              <Archive className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {notification.complaint && (
                          <Link
                            href={`/complaints/${notification.complaint.id}`}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 block"
                            onClick={() => setIsOpen(false)}
                          >
                            View complaint: {notification.complaint.title}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {notifications.length > 5 && (
              <div className="p-3 border-t border-gray-100">
                <Button variant="outline" size="sm" className="w-full">
                  View all notifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
