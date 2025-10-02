"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api';
import { authStore, getNextParam } from '@/lib/auth';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ 
    resolver: zodResolver(schema) 
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    console.log('Attempting login with:', { email: values.email });
    
    try {
      const res = await authApi.login(values);
      console.log('Login successful:', res);
      authStore.set({ user: res.user });
      const next = getNextParam();
      window.location.href = next || '/dashboard';
    } catch (error: unknown) {
      console.log('Login error caught:', error);
      console.log('Error type:', typeof error);
      console.log('Error constructor:', error?.constructor?.name);
      console.log('Error has response:', 'response' in (error as Record<string, unknown>));
      
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle AxiosError structure
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: { message?: string };
            status?: number;
          } 
        };
        console.log('AxiosError response:', axiosError.response);
        
        const backendMessage = axiosError?.response?.data?.message;
        const statusCode = axiosError?.response?.status;
        
        console.log('Backend message:', backendMessage);
        console.log('Status code:', statusCode);
        
        if (backendMessage) {
          errorMessage = backendMessage;
        } else if (statusCode === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (statusCode === 400) {
          errorMessage = 'Invalid request. Please check your input and try again.';
        } else if (statusCode && statusCode >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else {
        console.log('Not an AxiosError, error structure:', error);
      }
      
      console.log('Final error message:', errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">DV</span>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your DhakaVoice account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <Field label="Email" error={errors.email?.message}>
              <Input id="email" type="email" placeholder="Enter your email" {...register('email')} />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <Input id="password" type="password" placeholder="Enter your password" {...register('password')} />
            </Field>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}