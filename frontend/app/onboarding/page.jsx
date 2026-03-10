"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import ParticleField from '@/components/landing/ParticleField';
import Hero from '@/components/landing/Hero';
import ARIAChat from '@/components/landing/ARIAChat';
import TrustBar from '@/components/landing/TrustBar';

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleChatComplete = () => {
    router.push('/processing');
  };

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0">
        {/* Radial purple glow at top */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-18"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)'
          }}
        />
        
        {/* Radial cyan glow at bottom right */}
        <div 
          className="absolute bottom-0 right-0 w-[600px] h-[300px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* Particle Field */}
      <ParticleField />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Hero />
        <ARIAChat onComplete={handleChatComplete} />
        <TrustBar />
      </div>
    </div>
  );
}
