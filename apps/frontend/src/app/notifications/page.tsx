"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { Bell, CheckCircle, AlertCircle, Info, X, Clock, User, MessageSquare, ThumbsUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'COMPLAINT_STATUS_CHANGE':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'NEW_COMMENT':
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'NEW_UPVOTE':
      return <ThumbsUp className="h-5 w-5 text-orange-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationTitle = (type: string) => {
  switch (type) {
    case 'COMPLAINT_STATUS_CHANGE':
      return 'Status Update';
    case 'NEW_COMMENT':
      return 'New Comment';
    case 'NEW_UPVOTE':
      return 'New Upvote';
    default:
      return 'Notification';
  }
};

export default function NotificationsPage() {
  const { user, mounted } = useAuth();
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead(prev => new Set(prev).add(notificationId));
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Show loading state until auth is mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please log in</h2>
          <p className="text-muted-foreground mb-4">You need to be logged in to view your notifications.</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your complaint activity and community engagement
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
          <p className="text-muted-foreground mb-4">
            You&apos;ll receive notifications when there&apos;s activity on your complaints or when you engage with others.
          </p>
          <Button asChild>
            <Link href="/complaints/new">Submit Your First Complaint</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all duration-200 ${
                notification.status === 'READ' 
                  ? 'bg-muted/30 border-muted' 
                  : 'bg-background border-primary/20 shadow-sm'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">
                            {getNotificationTitle(notification.type)}
                          </h3>
                          {notification.status === 'UNREAD' && (
                            <Badge variant="secondary" className="h-5 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(notification.createdAt)}</span>
                          </div>
                          {notification.data?.complaintId && typeof notification.data.complaintId === 'string' ? (
                            <Link 
                              href={`/complaints/${notification.data.complaintId}`}
                              className="text-primary hover:underline"
                            >
                              View Complaint
                            </Link>
                          ) : null}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {notification.status === 'UNREAD' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markingAsRead.has(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {notifications.length > 0 && (
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Total: {notifications.length} notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-primary font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="text-muted-foreground">
              Last updated: {formatRelativeTime(new Date())}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
