"use client";

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export function GlobalAuthLoader() {
  const { isLoading, isInitialized } = useAuth();
  const pathname = usePathname();
  
  // Define public routes that should NOT show auth loader
  const publicRoutes = [
    '/login', 
    '/signup', 
    '/', 
    '/forgot-password', 
    '/reset-password',
    '/verify-email',
    '/auth/callback'
  ];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Skip loader for public routes
  if (isPublicRoute) {
    return null;
  }
  
  // Only show loader during initial auth check for protected routes
  if (!isLoading || isInitialized) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent absolute top-0"></div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">Loading Odito AI</h2>
          <p className="text-muted-foreground text-sm">Checking your authentication...</p>
        </div>
      </div>
    </div>
  );
}
