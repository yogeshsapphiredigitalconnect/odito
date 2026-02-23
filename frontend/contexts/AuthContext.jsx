"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import apiService from '@/lib/apiService';
import { clearPaymentIntent } from '@/utils/paymentUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const response = await apiService.getProfile();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token might be expired, remove it
        apiService.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await apiService.login(email, password);
      apiService.setToken(result.data.token);
      setUser(result.data.user);
      return { success: true, user: result.data.user };
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const result = await apiService.register(userData);
      apiService.setToken(result.data.token);
      setUser(result.data.user);
      return { success: true, user: result.data.user };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiService.removeToken();
      setUser(null);
      // Clear payment intent on logout
      clearPaymentIntent();
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    setUser, // Add setUser to the value object
    loginWithGoogle: async () => {
      // This will be handled by the NextAuth signIn flow
      // The actual Google login will be triggered from the UI components
      return { success: true };
    }
  };

  return (
    <SessionProvider>
      <AuthContextInner value={value}>
        {children}
      </AuthContextInner>
    </SessionProvider>
  );
}

// Inner component to handle NextAuth session
function AuthContextInner({ value, children }) {
  const { data: session } = useSession();
  const { setUser } = value;

  // Handle NextAuth session changes (Google login)
  useEffect(() => {
    console.log("AuthContext - Session changed:", session);
    
    if (session?.backendToken && session?.backendUser) {
      console.log("AuthContext - Storing backend token and user");
      console.log("AuthContext - Backend user:", session.backendUser);
      
      // Store backend JWT in localStorage
      apiService.setToken(session.backendToken);
      
      // Update user state with backend user data
      setUser(session.backendUser);
      
      console.log("AuthContext - User state updated, clearing NextAuth session");
      
      // Clear NextAuth session after successful bootstrap
      signOut({ redirect: false });
    }
  }, [session, setUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
