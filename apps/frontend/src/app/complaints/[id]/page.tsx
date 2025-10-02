"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { complaintsApi, Complaint, commentsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, ComplaintTypeBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ThumbsUp, MessageSquare, MapPin, Clock, User, X, Settings, Edit3, Trash2, Share2, Eye, Flag } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

// Design system colors are now handled by StatusBadge and ComplaintTypeBadge components

export default function ComplaintDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upvoted, setUpvoted] = useState(false);
  const [comments, setComments] = useState<{ id: string; content: string; user: { id: string; name: string }; createdAt: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const data = await complaintsApi.get(params.id as string);
        setComplaint(data);
        try {
          const list = await commentsApi.list(params.id as string);
          setComments(list);
        } catch {}
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error?.response?.data?.message ?? 'Failed to load complaint');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const handleUpvote = async () => {
    if (!complaint) return;
    try {
      const result = await complaintsApi.upvoteToggle(complaint.id);
      setUpvoted(result.upvoted);
      setComplaint(prev => prev ? {
        ...prev,
        _count: {
          upvotes: (prev._count?.upvotes ?? 0) + (result.upvoted ? 1 : -1),
          comments: prev._count?.comments ?? 0
        }
      } : null);
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleAddComment = async () => {
    if (!complaint || !newComment.trim()) return;
    try {
      const c = await commentsApi.add(complaint.id, newComment.trim());
      setComments((prev) => [...prev, c]);
      setNewComment('');
    } catch {
      // swallow
    }
  };

  const handleStatusChange = async (newStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => {
    if (!complaint) return;
    setUpdatingStatus(true);
    try {
      const updated = await complaintsApi.updateStatus(complaint.id, newStatus);
      setComplaint(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleShare = async () => {
    if (!complaint || sharing) return;
    
    const shareUrl = window.location.href;
    const shareText = `Check out this complaint: "${complaint.title}" - ${complaint.description.substring(0, 100)}...`;
    
    try {
      setSharing(true);
      
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
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Complaint Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The complaint you are looking for does not exist.'}</p>
          <Button asChild>
            <Link href="/complaints">Back to Complaints</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          
          <div className="bg-white light:bg-gray-800 rounded-xl shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <ComplaintTypeBadge type={complaint.type} />
                  <StatusBadge status={complaint.status} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{complaint.title}</h1>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {complaint.user?.name ?? 'Anonymous'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(complaint.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {complaint._count?.upvotes ?? 0} upvotes
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {complaint._count?.comments ?? 0} comments
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpvote}
                  variant={upvoted ? "default" : "outline"}
                  size="sm"
                  disabled={user?.id === complaint.user?.id}
                  className={user?.id === complaint.user?.id ? 'opacity-50 cursor-not-allowed' : ''}
                  title={user?.id === complaint.user?.id ? "You can't upvote your own complaint" : "Upvote this complaint"}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {upvoted ? 'Upvoted' : 'Upvote'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShare}
                  disabled={sharing}
                  className="disabled:opacity-50"
                >
                  <Share2 className={`h-4 w-4 mr-2 ${sharing ? 'animate-pulse' : ''}`} />
                  {sharing ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            </div>
            
            {/* Description */}
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-wrap">{complaint.description}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {complaint.images && complaint.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Images ({complaint.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {complaint.images.map((image: { signedThumbUrl?: string; signedMediumUrl?: string; signedOriginalUrl?: string }, index: number) => (
                      <button 
                        key={index} 
                        type="button" 
                        className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:opacity-90 transition-opacity" 
                        onClick={() => setLightbox(image.signedMediumUrl || image.signedOriginalUrl || image.signedThumbUrl || '')}
                      >
                        {(image.signedThumbUrl || image.signedMediumUrl || image.signedOriginalUrl) && (
                          <img 
                            src={image.signedThumbUrl || image.signedMediumUrl || image.signedOriginalUrl!} 
                            alt={`Complaint image ${index + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  <ul className="space-y-4 mb-6">
                    {comments.map((c) => (
                      <li key={c.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{c.user.name}</span>
                          <span>•</span>
                          <span>{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-700">{c.content}</div>
                      </li>
                    ))}
                  </ul>
                )}
                
                {user ? (
                  <div className="flex gap-2">
                    <Input 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      placeholder="Add a comment..." 
                      className="flex-1" 
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      Post
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">Please sign in to comment</p>
                    <Button asChild size="sm">
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Status Management - Only for complaint owner */}
            {user && user.id === complaint.user?.id && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Status Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Settings className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          Current Status: <StatusBadge status={complaint.status} size="sm" />
                        </h4>
                        <p className="text-sm text-blue-700">
                          {complaint.status === 'PENDING' && 'Your complaint is waiting for city officials to review it.'}
                          {complaint.status === 'IN_PROGRESS' && 'City officials are currently working on your complaint.'}
                          {complaint.status === 'RESOLVED' && 'Your complaint has been resolved. Please verify if the issue is actually fixed.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {complaint.status === 'RESOLVED' ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Has this issue been completely resolved? You can confirm or reopen the complaint.
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange('PENDING')}
                          disabled={updatingStatus}
                        >
                          Reopen Complaint
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Could add a confirmation dialog here
                            alert('Thank you for confirming! This helps us track resolution rates.');
                          }}
                        >
                          Confirm Resolved
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {complaint.status === 'PENDING' 
                          ? 'Your complaint is pending review by city officials. You cannot change the status until they start working on it.'
                          : 'City officials are working on your complaint. You can mark it as resolved once the issue is fixed.'
                        }
                      </p>
                      {complaint.status === 'IN_PROGRESS' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange('RESOLVED')}
                          disabled={updatingStatus}
                        >
                          Mark as Resolved
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Complaint Submitted</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(complaint.createdAt)} • {complaint.user?.name ?? 'Anonymous'}
                      </div>
                    </div>
                    <StatusBadge status="PENDING" size="sm" />
                  </div>
                  
                  {complaint.status === 'IN_PROGRESS' && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Status Changed to In Progress</div>
                        <div className="text-xs text-muted-foreground">
                          City officials are now working on this complaint
                        </div>
                      </div>
                      <StatusBadge status="IN_PROGRESS" size="sm" />
                    </div>
                  )}
                  
                  {complaint.status === 'RESOLVED' && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Status Changed to Resolved</div>
                        <div className="text-xs text-muted-foreground">
                          {complaint.user?.id === user?.id ? 'You marked this as resolved' : 'Complaint has been resolved'}
                        </div>
                      </div>
                      <StatusBadge status="RESOLVED" size="sm" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Complaint Information */}
            <Card>
              <CardHeader>
                <CardTitle>Complaint Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Reported by:</span>
                    <span className="font-medium">{complaint.user?.name ?? 'Anonymous'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{formatDate(complaint.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <StatusBadge status={complaint.status} size="sm" />
                    <span className="text-muted-foreground">Status:</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <ComplaintTypeBadge type={complaint.type} size="sm" />
                    <span className="text-muted-foreground">Category:</span>
                  </div>

                  {(complaint.thana || complaint.ward) && (
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Location:</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        {complaint.thana && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Thana: </span>
                            <span className="font-medium">{complaint.thana.name}</span>
                          </div>
                        )}
                        {complaint.ward && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Ward: </span>
                            <span className="font-medium">
                              {complaint.ward.cityCorporation} Ward {complaint.ward.wardNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Upvotes:</span>
                          <span className="font-medium">{complaint._count?.upvotes ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Comments:</span>
                          <span className="font-medium">{complaint._count?.comments ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Actions */}
            {user && user.id === complaint.user?.id && (
              <Card>
                <CardHeader>
                  <CardTitle>Owner Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Complaint
                  </Button>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Complaint
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Upvote System Explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  How Upvoting Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• <strong>Upvote</strong> complaints you think are important or relevant</p>
                  <p>• <strong>One vote per user</strong> - you can upvote or remove your upvote</p>
                  <p>• <strong>Higher upvotes</strong> make complaints more visible to city officials</p>
                  <p>• <strong>Sort by &quot;Most Upvoted&quot;</strong> to see popular issues first</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Current upvotes:</strong> {complaint._count?.upvotes ?? 0} people support this complaint
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Report/Flag */}
            {user && user.id !== complaint.user?.id && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                    <Flag className="h-4 w-4 mr-2" />
                    Report Complaint
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setLightbox(null)}>
          <div className="max-w-4xl max-h-full p-4">
            <img src={lightbox} alt="Complaint image" className="max-w-full max-h-full object-contain rounded-lg" />
            <button 
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}