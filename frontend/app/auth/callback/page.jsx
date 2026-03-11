"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/lib/apiService';

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      // Wait for auth context to be loaded
      if (isLoading) return;
      
      // If no user after loading, redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      // Prevent multiple redirects
      if (isRedirecting) return;
      setIsRedirecting(true);

      try {
        // Check if user has existing projects
        const response = await apiService.getProjects(1, 1);
        const projects = response?.data?.projects || [];
        
        if (projects.length > 0) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } catch (error) {
        console.error("Failed to check user projects:", error);
        router.push('/onboarding');
      }
    };

    handleRedirect();
  }, [user, isLoading, router, isRedirecting]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
}
