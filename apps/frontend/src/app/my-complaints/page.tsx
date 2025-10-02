"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, ComplaintTypeBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/lib/auth-context";
import { complaintsApi, type Complaint } from "@/lib/api";
import { formatLocationDisplay } from "@/lib/locations";
import { Search, ThumbsUp, MessageSquare, MapPin, Clock, User, Share2, Flag } from "lucide-react";
import React from "react";

// Location Display Component
const LocationDisplay = ({ thanaId, wardId }: { thanaId?: number; wardId?: number }) => {
  const [locationText, setLocationText] = React.useState('Loading...');

  React.useEffect(() => {
    formatLocationDisplay(thanaId, wardId).then(setLocationText);
  }, [thanaId, wardId]);

  return <span>{locationText}</span>;
};

// Memoized Complaint Card Component for better performance
const ComplaintCard = React.memo(({ 
  complaint, 
  upvoting, 
  sharing, 
  onUpvote, 
  onShare 
}: {
  complaint: Complaint;
  upvoting: Set<string>;
  sharing: Set<string>;
  onUpvote: (id: string) => void;
  onShare: (complaint: Complaint) => void;
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    window.location.href = `/complaints/${complaint.id}`;
  };
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer hover:bg-muted/30"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ComplaintTypeBadge type={complaint.type} size="sm" />
              <StatusBadge status={complaint.status} size="sm" />
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <User className="h-3 w-3 mr-1" />
                Your Complaint
              </span>
            </div>
            <CardTitle className="text-xl">{complaint.title}</CardTitle>
            <p className="text-muted-foreground line-clamp-2">{complaint.description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Location and Date */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <LocationDisplay thanaId={complaint.thanaId} wardId={complaint.wardId} />
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Images Preview */}
          {complaint.images && complaint.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {complaint.images.slice(0, 3).map((image, index) => (
                <div key={index} className="flex-shrink-0">
                  <img
                    src={image.signedThumbUrl || image.signedMediumUrl || image.signedOriginalUrl || ''}
                    alt={`Complaint image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                </div>
              ))}
              {complaint.images.length > 3 && (
                <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-lg border flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">+{complaint.images.length - 3}</span>
                </div>
              )}
            </div>
          )}

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{complaint._count?.upvotes ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{complaint._count?.comments ?? 0}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpvote(complaint.id)}
                disabled={upvoting.has(complaint.id)}
                className="h-8 opacity-50 cursor-not-allowed"
                title="You can't upvote your own complaint"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Your Complaint
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(complaint)}
                disabled={sharing.has(complaint.id)}
                className="h-8"
              >
                <Share2 className="h-4 w-4 mr-1" />
                {sharing.has(complaint.id) ? 'Sharing...' : 'Share'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ComplaintCard.displayName = 'ComplaintCard';

function MyComplaintsContent() {
  const { user, mounted } = useAuth();
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('latest');
  const [upvoting, setUpvoting] = useState<Set<string>>(new Set());
  const [sharing, setSharing] = useState<Set<string>>(new Set());

  const pageSize = 10;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadComplaints = useCallback(async (reset = false) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        pageSize,
        search: search || undefined,
        type: category || undefined,
        sort: (sort as 'latest' | 'top' | 'oldest') || 'latest',
        userId: user.id // Always filter by current user
      };
      
      const data = await complaintsApi.list(params);
      
      if (reset) {
        setComplaints(data.items);
        setPage(1);
      } else {
        setComplaints(prev => [...prev, ...data.items]);
      }
      
      setHasMore(data.items.length === pageSize);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Failed to load complaints:', error?.response?.data?.message || err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, search, category, sort, pageSize]);

  // Load complaints when filters change
  useEffect(() => {
    loadComplaints(true);
  }, [search, category, sort, user?.id, loadComplaints]);

  // Load more complaints when scrolling
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      loadComplaints(false);
    }
  }, [page, loadComplaints]);

  const handleUpvote = useCallback(async (complaintId: string) => {
    if (!user) return;
    
    setUpvoting(prev => new Set(prev).add(complaintId));
    
    try {
      await complaintsApi.upvoteToggle(complaintId);
      
      // Optimistic update
      setComplaints(prev => prev.map(complaint => 
        complaint.id === complaintId 
          ? {
              ...complaint,
              _count: {
                upvotes: (complaint._count?.upvotes || 0) + 1,
                comments: complaint._count?.comments || 0
              }
            }
          : complaint
      ));
    } catch (error) {
      console.error('Failed to upvote:', error);
    } finally {
      setUpvoting(prev => {
        const newSet = new Set(prev);
        newSet.delete(complaintId);
        return newSet;
      });
    }
  }, [user]);

  const handleShare = useCallback(async (complaint: Complaint) => {
    if (!complaint || sharing.has(complaint.id)) return;
    
    const shareUrl = `${window.location.origin}/complaints/${complaint.id}`;
    const shareText = `Check out this complaint: "${complaint.title}" - ${complaint.description.substring(0, 100)}...`;
    
    try {
      setSharing(prev => new Set(prev).add(complaint.id));
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: complaint.title,
            text: shareText,
            url: shareUrl,
          });
        } catch (err: unknown) {
          if (err instanceof Error) {
            if (err.name === 'AbortError') {
              console.log('Share cancelled by user');
              return;
            } else if (err.name === 'InvalidStateError') {
              console.log('Share operation already in progress, please wait');
              return;
            } else {
              console.log('Web Share API failed, falling back to clipboard:', err.message);
              throw err;
            }
          }
          throw err;
        }
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        alert('Complaint link copied to clipboard!');
      }
    } catch (err: unknown) {
      console.error('Share failed:', err);
      const userConfirmed = confirm(`Share this complaint?\n\n${complaint.title}\n\nCopy this link: ${shareUrl}`);
      if (userConfirmed) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        } catch {
          prompt('Copy this link to share:', shareUrl);
        }
      }
    } finally {
      setSharing(prev => {
        const newSet = new Set(prev);
        newSet.delete(complaint.id);
        return newSet;
      });
    }
  }, [sharing]);

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'ROADS', label: 'Roads & Infrastructure' },
    { value: 'ELECTRICITY', label: 'Electricity' },
    { value: 'WATER', label: 'Water Supply' },
    { value: 'POLLUTION', label: 'Pollution' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'OTHERS', label: 'Others' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'top', label: 'Most Upvoted' },
  ];

  // Show loading state until auth is mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="p-6">
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
          <p className="text-muted-foreground mb-4">You need to be logged in to view your complaints.</p>
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Complaints</h1>
            <p className="text-muted-foreground">View and manage your submitted complaints</p>
          </div>
          <Button asChild>
            <Link href="/complaints/new" className="flex items-center gap-2">
              New Complaint
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {loading && (
            <div className="absolute top-2 right-2 z-10">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your complaints..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {loading && complaints.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-12">
          <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No complaints found</h3>
          <p className="text-muted-foreground mb-4">
            {search || category ? 'Try adjusting your filters' : "You haven't submitted any complaints yet."}
          </p>
          <Button asChild>
            <Link href="/complaints/new">Submit Your First Complaint</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              upvoting={upvoting}
              sharing={sharing}
              onUpvote={handleUpvote}
              onShare={handleShare}
            />
          ))}
          
          {hasMore && (
            <div className="text-center py-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyComplaintsPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    }>
      <MyComplaintsContent />
    </Suspense>
  );
}
