"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import ParticleField from '@/components/landing/ParticleField';
import Hero from '@/components/landing/Hero';
import ARIAChat from '@/components/landing/ARIAChat';
import TrustBar from '@/components/landing/TrustBar';

export default function MarketingPage() {
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text)" }}>Loading...</div>
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
    <div className="hero">
      <div className="hero-bg" />
      <ParticleField />
      <Hero />
      <ARIAChat onComplete={handleChatComplete} />
      <TrustBar />
    </div>
  );
}
