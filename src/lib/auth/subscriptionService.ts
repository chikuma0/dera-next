import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../config/env';
import { clientEnv } from '../config/clientEnv';

export enum SubscriptionTier {
  FREE = 'free',
  PROFESSIONAL = 'professional',
  TEAM = 'team',
  ENTERPRISE = 'enterprise'
}

export interface SubscriptionDetails {
  id: string;
  tier: SubscriptionTier;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  startedAt: Date;
  endsAt?: Date;
  features: string[];
  price: number;
}

export class SubscriptionService {
  private supabase;
  
  constructor() {
    // Check if we're on the client side
    const isClient = typeof window !== 'undefined';
    
    if (isClient) {
      // Use clientEnv on the client side
      this.supabase = createClient(
        clientEnv.supabase.url,
        clientEnv.supabase.anonKey
      );
    } else {
      // Use server-side env variables
      const env = validateEnv();
      this.supabase = createClient(
        env.supabase.url,
        env.supabase.serviceRoleKey
      );
    }
  }
  
  /**
   * Get a user's current subscription
   */
  async getUserSubscription(userId: string): Promise<SubscriptionDetails | null> {
    try {
      // Get user's subscription
      const { data: subscription, error: subError } = await this.supabase
        .from('user_subscriptions')
        .select('id, tier_id, status, started_at, ends_at')
        .eq('user_id', userId)
        .single();
        
      if (subError || !subscription) {
        console.error('Error fetching user subscription:', subError);
        return null;
      }
      
      // Get tier details
      const { data: tier, error: tierError } = await this.supabase
        .from('subscription_tiers')
        .select('name, description, price_monthly, features')
        .eq('id', subscription.tier_id)
        .single();
        
      if (tierError || !tier) {
        console.error('Error fetching subscription tier:', tierError);
        return null;
      }
      
      return {
        id: subscription.id,
        tier: subscription.tier_id as SubscriptionTier,
        status: subscription.status,
        startedAt: new Date(subscription.started_at),
        endsAt: subscription.ends_at ? new Date(subscription.ends_at) : undefined,
        features: Array.isArray(tier.features) ? tier.features : JSON.parse(tier.features),
        price: tier.price_monthly
      };
    } catch (error) {
      console.error('Subscription service error:', error);
      return null;
    }
  }
  
  /**
   * Check if a user has access to a specific feature
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription || subscription.status !== 'active') {
      return false;
    }
    
    return subscription.features.includes(feature);
  }
  
  /**
   * Upgrade a user's subscription
   */
  async upgradeSubscription(
    userId: string,
    newTier: SubscriptionTier,
    paymentMethodId?: string
  ): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with Stripe or another payment processor
      // For now, we'll just update the database
      const { error } = await this.supabase
        .from('user_subscriptions')
        .update({
          tier_id: newTier,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error upgrading subscription:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Subscription upgrade error:', error);
      return false;
    }
  }
  
  /**
   * Cancel a user's subscription
   */
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error canceling subscription:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      return false;
    }
  }
  
  /**
   * Get all available subscription tiers
   */
  async getSubscriptionTiers(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    features: string[];
  }>> {
    try {
      const { data, error } = await this.supabase
        .from('subscription_tiers')
        .select('*')
        .order('price_monthly');
        
      if (error) {
        console.error('Error fetching subscription tiers:', error);
        return [];
      }
      
      return data.map(tier => ({
        id: tier.id,
        name: tier.name,
        description: tier.description,
        priceMonthly: tier.price_monthly,
        priceYearly: tier.price_yearly,
        features: Array.isArray(tier.features) ? tier.features : JSON.parse(tier.features)
      }));
    } catch (error) {
      console.error('Error getting subscription tiers:', error);
      return [];
    }
  }
} 