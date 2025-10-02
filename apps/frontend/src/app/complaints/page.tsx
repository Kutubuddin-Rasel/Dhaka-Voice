"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
  isOwnComplaint, 
  upvoting, 
  sharing, 
  onUpvote, 
  onShare 
}: {
  complaint: Complaint;
  isOwnComplaint: (complaint: Complaint) => boolean;
  upvoting: Set<string>;
  sharing: Set<string>;
  onUpvote: (id: string) => void;
  onShare: (complaint: Complaint) => void;
}) => {
  const isOwn = isOwnComplaint(complaint);
  
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
              {isOwn && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <User className="h-3 w-3 mr-1" />
                  Your Complaint
                </span>
              )}
            </div>
            <CardTitle className="text-xl">{complaint.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onUpvote(complaint.id)}
              disabled={upvoting.has(complaint.id) || isOwn}
              className={`hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 ${isOwn ? 'cursor-not-allowed' : ''}`}
              title={isOwn ? "You can't upvote your own complaint" : "Upvote this complaint"}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${upvoting.has(complaint.id) ? 'animate-pulse' : ''}`} />
              {complaint._count?.upvotes || 0}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = `/complaints/${complaint.id}`}
              className="hover:bg-green-50 hover:text-green-600"
              title="View comments"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              {complaint._count?.comments || 0}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onShare(complaint)}
              disabled={sharing.has(complaint.id)}
              className="hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
              title="Share this complaint"
            >
              <Share2 className={`h-4 w-4 ${sharing.has(complaint.id) ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {complaint.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <LocationDisplay thanaId={complaint.thanaId} wardId={complaint.wardId} />
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(complaint.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ComplaintCard.displayName = 'ComplaintCard';

function ComplaintsListContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const search = searchParams.get('q') || searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'latest';
  const pageSize = 10;
  
  const [upvoting, setUpvoting] = useState<Set<string>>(new Set());
  const [sharing, setSharing] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState(search);

  // Load complaints based on current filters
  const loadComplaints = useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, string | number | undefined> = {
        page: pageNum,
        pageSize,
        search: search || undefined,
        type: category || undefined, // Backend expects 'type', not 'category'
        sort: sort || 'latest'
      };
      
      // All complaints page shows all complaints (no user filtering)
      
      const data = await complaintsApi.list(params);
      
      if (reset) {
        setComplaints(data.items);
      } else {
        setComplaints(prev => [...prev, ...data.items]);
      }
      
      setHasMore(data.items.length === pageSize);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message ?? 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, pageSize]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`/complaints?${params.toString()}`);
  }, [searchParams, router]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        handleSearch(searchInput);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput, search, handleSearch]);

  // Sync search input with URL parameter
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Load initial complaints
  useEffect(() => {
    loadComplaints(1, true);
  }, [loadComplaints]);

  // Handle category filter
  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    router.push(`/complaints?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    router.push(`/complaints?${params.toString()}`);
  };


  // Load more complaints
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadComplaints(page + 1, false);
    }
  };

  // Check if complaint belongs to current user (memoized)
  const isOwnComplaint = useCallback((complaint: Complaint) => {
    return user?.id === complaint.user?.id;
  }, [user?.id]);

  // Handle upvote toggle
  const handleUpvote = async (complaintId: string) => {
    if (!user) return;
    
    try {
      setUpvoting(prev => new Set(prev).add(complaintId));
      const result = await complaintsApi.upvoteToggle(complaintId);
      
      // Update the complaint in the list
      setComplaints(prev => prev.map(complaint => 
        complaint.id === complaintId 
          ? { 
              ...complaint, 
              _count: { 
                upvotes: result.upvoted 
                  ? (complaint._count?.upvotes || 0) + 1 
                  : Math.max(0, (complaint._count?.upvotes || 0) - 1),
                comments: complaint._count?.comments || 0
              }
            }
          : complaint
      ));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Failed to upvote:', error?.response?.data?.message);
    } finally {
      setUpvoting(prev => {
        const newSet = new Set(prev);
        newSet.delete(complaintId);
        return newSet;
      });
    }
  };

  // Handle share functionality
  const handleShare = async (complaint: Complaint) => {
    // Prevent multiple simultaneous share operations
    if (sharing.has(complaint.id)) {
      return;
    }

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
          // Handle specific Web Share API errors
          if (err instanceof Error) {
            if (err.name === 'AbortError') {
              // User cancelled the share dialog - this is normal, don't show error
              console.log('Share cancelled by user');
              return;
            } else if (err.name === 'InvalidStateError') {
              // Previous share operation is still in progress
              console.log('Share operation already in progress, please wait');
              return;
            } else {
              // Other errors - fall back to clipboard
              console.log('Web Share API failed, falling back to clipboard:', err.message);
              throw err; // This will trigger the fallback
            }
          }
          throw err;
        }
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        alert('Complaint link copied to clipboard!');
      }
    } catch (err: unknown) {
      // Final fallback: show the URL in a prompt
      console.error('Share failed:', err);
      const userConfirmed = confirm(`Share this complaint?\n\n${complaint.title}\n\nCopy this link: ${shareUrl}`);
      if (userConfirmed) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        } catch (clipboardErr) {
          // Ultimate fallback - just show the URL
          prompt('Copy this link to share:', shareUrl);
        }
      }
    } finally {
      // Always remove from sharing set
      setSharing(prev => {
        const newSet = new Set(prev);
        newSet.delete(complaint.id);
        return newSet;
      });
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Complaints</h1>
            <p className="text-muted-foreground">
              Browse all complaints and show your support
            </p>
          </div>
          <Button asChild>
            <Link href="/complaints/new">
              Submit Complaint
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
              placeholder="Search complaints..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
            <option value="">All Categories</option>
            <option value="ROADS">Roads & Infrastructure</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="WATER">Water Supply</option>
            <option value="POLLUTION">Pollution</option>
            <option value="TRANSPORT">Transport</option>
            <option value="OTHERS">Others</option>
          </Select>
          
          <Select value={sort} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="top">Most Upvoted</option>
          </Select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Complaints List */}
      <div className="grid gap-6 transition-all duration-300">
        {loading && complaints.length === 0 ? (
          // Initial loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              isOwnComplaint={isOwnComplaint}
              upvoting={upvoting}
              sharing={sharing}
              onUpvote={handleUpvote}
              onShare={handleShare}
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="min-w-[200px]"
          >
            {loading ? 'Loading...' : 'Load More Complaints'}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && complaints.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Flag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No complaints found
          </h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to find complaints.
          </p>
          <Button asChild>
            <Link href="/complaints/new">
              Submit Your First Complaint
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ComplaintsListPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complaints</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    }>
      <ComplaintsListContent />
    </Suspense>
  );
}