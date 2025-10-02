"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authStore } from '@/lib/auth';
import { authApi, usersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDestructive, AlertSuccess } from '@/components/ui/alert';
import { LoadingPage } from '@/components/ui/loading';
import { Lock, Bell, Shield, Settings as SettingsIcon, Key, Mail, Download, Trash2, LogOut, CheckCircle } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const [user] = useState(authStore.get().user);
  const [mounted, setMounted] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.replace('/login?next=/settings');
      return;
    }
  }, [user, router]);

  const onSubmitPassword = async (values: PasswordFormValues) => {
    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      setPasswordSuccess(true);
      reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setPasswordError(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    authStore.clear();
    router.push('/');
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      const data = await usersApi.exportData();
      
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dhaka-voice-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion.');
      return;
    }

    setDeletingAccount(true);
    try {
      await usersApi.deleteAccount();
      authStore.clear();
      alert('Your account has been deleted successfully.');
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
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
              <SettingsIcon className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-xl text-gray-600">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Security Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-red-900">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                Security Settings
              </CardTitle>
              <CardDescription className="text-red-700">
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-6">
                {passwordError && (
                  <AlertDestructive
                    title="Password Change Failed"
                    description={passwordError}
                  />
                )}

                {passwordSuccess && (
                  <AlertSuccess
                    title="Password Changed"
                    description="Your password has been updated successfully!"
                  />
                )}

                <div className="space-y-4">
                  <Field label="Current Password" error={errors.currentPassword?.message}>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        type="password" 
                        {...register('currentPassword')} 
                        placeholder="Enter your current password"
                        className="pl-10 h-11"
                      />
                    </div>
                  </Field>

                  <Field label="New Password" error={errors.newPassword?.message}>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        type="password" 
                        {...register('newPassword')} 
                        placeholder="Enter your new password"
                        className="pl-10 h-11"
                      />
                    </div>
                  </Field>

                  <Field label="Confirm New Password" error={errors.confirmPassword?.message}>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        type="password" 
                        {...register('confirmPassword')} 
                        placeholder="Confirm your new password"
                        className="pl-10 h-11"
                      />
                    </div>
                  </Field>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" disabled={changingPassword} className="flex-1">
                    {changingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => reset()} className="px-6">
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-purple-900">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                Notification Settings
              </CardTitle>
              <CardDescription className="text-purple-700">
                Choose how you want to be notified about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Email Notifications</div>
                      <div className="text-sm text-blue-700">Receive updates about your complaints</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Bell className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-green-900">Push Notifications</div>
                      <div className="text-sm text-green-700">Get real-time updates in your browser</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Note:</strong> Notification preferences are saved locally in your browser. 
                    Email notifications will be implemented in a future update.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <SettingsIcon className="h-5 w-5 text-gray-600" />
              </div>
              Account Actions
            </CardTitle>
            <CardDescription className="text-gray-700">
              Manage your account and data
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Download className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <div className="font-medium text-cyan-900">Export Data</div>
                      <div className="text-sm text-cyan-700">Download your complaint data as JSON</div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleExportData} 
                    disabled={exportingData}
                    variant="outline" 
                    className="w-full bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800"
                  >
                    {exportingData ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export My Data
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-red-900">Delete Account</div>
                      <div className="text-sm text-red-700">Permanently delete your account and data</div>
                    </div>
                  </div>
                  
                  {!showDeleteConfirm ? (
                    <Button 
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline" 
                      className="w-full bg-red-50 hover:bg-red-100 border-red-300 text-red-800"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-red-700 font-medium">
                        ⚠️ This action cannot be undone!
                      </div>
                      <div className="text-sm text-red-600">
                        Type <span className="font-mono bg-red-100 px-1 rounded">DELETE</span> to confirm:
                      </div>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="border-red-300 focus:border-red-500"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleDeleteAccount}
                          disabled={deletingAccount || deleteConfirmText !== 'DELETE'}
                          variant="outline"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 disabled:opacity-50"
                        >
                          {deletingAccount ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Confirm Delete
                            </>
                          )}
                        </Button>
                        <Button 
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          variant="outline"
                          className="px-4 border-gray-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200 w-full">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <LogOut className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="font-medium text-orange-900 mb-2">Sign Out</div>
                  <div className="text-sm text-orange-700 mb-4">Sign out of your account</div>
                  <Button variant="outline" onClick={handleLogout} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
