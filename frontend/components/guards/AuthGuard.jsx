"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth check is complete
    if (isInitialized && !isLoading && !isAuthenticated) {
      console.log('🔓 AuthGuard: User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isInitialized, router]);

  // Show loading spinner during auth check
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render protected content
  return children;
}

// For public routes that should redirect to dashboard if user is already logged in
export function PublicGuard({ children }) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if user is authenticated and auth check is complete
    if (isInitialized && !isLoading && isAuthenticated) {
      console.log('🔐 PublicGuard: User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, isInitialized, router]);

  // For public routes, render content immediately - don't wait for auth check
  // This prevents blocking on login/signup pages
  if (!isAuthenticated || isLoading) {
    return children;
  }

  // Don't render anything while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
