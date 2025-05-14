"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Session } from '@supabase/supabase-js';
import { SubscriptionService, SubscriptionDetails, SubscriptionTier } from '@/lib/auth/subscriptionService';
import { clientEnv } from '@/lib/config/clientEnv';

// Define the context shape
interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscription: SubscriptionDetails | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: object) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  upgradeSubscription: (tier: SubscriptionTier) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  hasFeatureAccess: (feature: string) => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize Supabase client with our hardcoded environment values to ensure they're available
  const supabase = createClientComponentClient({
    supabaseUrl: clientEnv.supabase.url,
    supabaseKey: clientEnv.supabase.anonKey
  });
  const subscriptionService = useMemo(() => new SubscriptionService(), []);
  
  // Initialize - check for existing session and subscribe to auth changes
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      // Get subscription if user exists
      if (initialSession?.user) {
        const userSubscription = await subscriptionService.getUserSubscription(initialSession.user.id);
        setSubscription(userSubscription);
      }
      
      // Set up listener for auth changes
      const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (newSession?.user) {
            const userSubscription = await subscriptionService.getUserSubscription(newSession.user.id);
            setSubscription(userSubscription);
          } else {
            setSubscription(null);
          }
        }
      );
      
      setIsLoading(false);
      
      // Clean up subscription
      return () => {
        authListener.unsubscribe();
      };
    };
    
    initAuth();
  }, [subscriptionService, supabase.auth]);
  
  // Auth methods
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };
  
  const signUp = async (email: string, password: string, metadata = {}) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: metadata }
    });
    return { error };
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };
  
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };
  
  // Subscription methods
  const upgradeSubscription = async (tier: SubscriptionTier) => {
    if (!user) return false;
    
    const success = await subscriptionService.upgradeSubscription(user.id, tier);
    
    if (success) {
      // Refresh subscription details
      const userSubscription = await subscriptionService.getUserSubscription(user.id);
      setSubscription(userSubscription);
    }
    
    return success;
  };
  
  const cancelSubscription = async () => {
    if (!user) return false;
    
    const success = await subscriptionService.cancelSubscription(user.id);
    
    if (success) {
      // Refresh subscription details
      const userSubscription = await subscriptionService.getUserSubscription(user.id);
      setSubscription(userSubscription);
    }
    
    return success;
  };
  
  const hasFeatureAccess = async (feature: string) => {
    if (!user) return false;
    return subscriptionService.hasFeatureAccess(user.id, feature);
  };
  
  // Context value
  const value = {
    user,
    session,
    subscription,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    upgradeSubscription,
    cancelSubscription,
    hasFeatureAccess
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 