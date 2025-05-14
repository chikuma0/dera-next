/**
 * Client-side environment configuration
 * This file provides fallback values for environment variables that might not be available in the browser.
 */

// Hardcoded values from .env file to ensure client-side availability
export const clientEnv = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcmdcubrgccmzabmyhrb.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjbWRjdWJyZ2NjbXphYm15aHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxODMzOTksImV4cCI6MjA1MDc1OTM5OX0.K2FV1L796PCWAei-t87ojd4JwZ2FhBT50gf9wwg0X4U',
  }
}; 