"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authStore } from '@/lib/auth';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDestructive, AlertSuccess } from '@/components/ui/alert';
import { LoadingPage, LoadingCard } from '@/components/ui/loading';
import { ArrowLeft, User, Mail, Calendar, FileText, MessageSquare, ThumbsUp, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(authStore.get().user);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState({
    complaintsSubmitted: 0,
    commentsMade: 0,
    upvotesGiven: 0
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '' }
  });

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.replace('/login?next=/profile');
      return;
    }
    
    // Load user statistics
    const loadStats = async () => {
      try {
        const statsData = await usersApi.getStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load user stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [user, router]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const updated = await usersApi.updateProfile(user.id, values);
      authStore.set({ user: updated });
      setUser(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
         
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-xl text-gray-600">Manage your account information and preferences</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Profile Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                Profile Information
              </CardTitle>
              <CardDescription className="text-blue-700">
                Update your personal details and account information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <LoadingCard lines={4} />
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <AlertDestructive
                      title="Update Failed"
                      description={error}
                    />
                  )}

                  {success && (
                    <AlertSuccess
                      title="Profile Updated"
                      description="Your profile has been updated successfully!"
                    />
                  )}

                  <div className="space-y-4">
                    <Field label="Full Name" error={errors.name?.message}>
                      <Input 
                        {...register('name')} 
                        placeholder="Enter your full name"
                        className="h-11"
                      />
                    </Field>

                    <Field label="Email Address" hint="Email cannot be changed">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          value={user.email} 
                          disabled 
                          className="pl-10 h-11 bg-gray-50 text-gray-600"
                        />
                      </div>
                    </Field>

                    <Field label="Member Since" hint="Account creation date">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          value={new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} 
                          disabled 
                          className="pl-10 h-11 bg-gray-50 text-gray-600"
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => reset()} className="px-6">
                      Reset
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-emerald-900">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                Account Statistics
              </CardTitle>
              <CardDescription className="text-emerald-700">
                Your activity and engagement on DhakaVoice
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-900">{stats.complaintsSubmitted}</div>
                      <div className="text-sm text-blue-700 font-medium">Complaints Submitted</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    Active Citizen
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-900">{stats.commentsMade}</div>
                      <div className="text-sm text-purple-700 font-medium">Comments Made</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    Community Member
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ThumbsUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-900">{stats.upvotesGiven}</div>
                      <div className="text-sm text-orange-700 font-medium">Upvotes Given</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                    Supporter
                  </Badge>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Account Status</div>
                  <Badge variant="success" className="text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified Member
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
