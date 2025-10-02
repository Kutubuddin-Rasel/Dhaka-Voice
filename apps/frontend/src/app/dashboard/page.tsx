"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge, ComplaintTypeBadge } from '@/components/ui/status-badge';
import { AlertDestructive } from '@/components/ui/alert';
import { LoadingPage, LoadingList } from '@/components/ui/loading';
import { Plus, MessageSquare, ThumbsUp, Clock, TrendingUp, FileText, CheckCircle } from 'lucide-react';
import { complaintsApi, Complaint } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

// Design system colors are now handled by StatusBadge and ComplaintTypeBadge components

export default function DashboardPage() {
  const { user, mounted } = useAuth();
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [complaintsError, setComplaintsError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    if (mounted && user?.id) {
      (async () => {
        try {
          setLoadingComplaints(true);
          const data = await complaintsApi.list({ userId: user.id, pageSize: 10 });
          setMyComplaints(data.items);
          
          // Calculate stats (memoized for performance)
          const stats = data.items.reduce((acc, complaint) => {
            acc.total++;
            if (complaint.status === 'PENDING') acc.pending++;
            else if (complaint.status === 'IN_PROGRESS') acc.inProgress++;
            else if (complaint.status === 'RESOLVED') acc.resolved++;
            return acc;
          }, { total: 0, pending: 0, inProgress: 0, resolved: 0 });
          
          setStats(stats);
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          setComplaintsError(err?.response?.data?.message ?? 'Failed to load your complaints.');
        } finally {
          setLoadingComplaints(false);
        }
      })();
    } else if (mounted && !user) {
      setLoadingComplaints(false);
    }
  }, [mounted, user]);

  if (!mounted) {
    return <LoadingPage />;
  }

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <p className="text-xl text-muted-foreground">Manage your complaints and stay updated on civic issues in Dhaka.</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Recent Complaints */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-2xl font-bold">My Recent Complaints</CardTitle>
              <CardDescription>Track the status of your submitted complaints</CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/my-complaints">
                View All My Complaints
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingComplaints && <LoadingList items={3} />}

            {complaintsError && (
              <AlertDestructive
                title="Failed to load complaints"
                description={complaintsError}
                className="mb-4"
              />
            )}

            {!loadingComplaints && !complaintsError && myComplaints.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No complaints yet</h3>
                <p className="text-muted-foreground mb-6">Start making a difference by submitting your first complaint.</p>
                <Button asChild size="lg">
                  <Link href="/complaints/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Your First Complaint
                  </Link>
                </Button>
              </div>
            )}

            {!loadingComplaints && !complaintsError && myComplaints.length > 0 && (
              <div className="space-y-4">
                {myComplaints.map((complaint) => (
                  <div 
                    key={complaint.id} 
                    className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/complaints/${complaint.id}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{complaint.title}</h4>
                        <ComplaintTypeBadge type={complaint.type} size="sm" />
                        <StatusBadge status={complaint.status} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(complaint.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {complaint._count?.upvotes ?? 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {complaint._count?.comments ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}