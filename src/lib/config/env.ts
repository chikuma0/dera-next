export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Validate Supabase URL format
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }

  // Validate key formats
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length < 30) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid');
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.length < 30) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY appears to be invalid');
  }

  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    features: {
      newsEnabled: process.env.ENABLE_NEWS_FEATURE === 'true'
    }
  } as const;
} 