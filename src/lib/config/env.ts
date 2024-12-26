export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  // More explicit undefined check
  const missing = required.filter(key => 
    typeof process.env[key] === 'undefined' || process.env[key] === ''
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Type assertion to help TypeScript understand these exist
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  // Validate Supabase URL format
  if (!SUPABASE_URL.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }

  // Validate key formats with explicit length checks
  if (!ANON_KEY || ANON_KEY.length < 30) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid');
  }

  if (!SERVICE_KEY || SERVICE_KEY.length < 30) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY appears to be invalid');
  }

  return {
    supabase: {
      url: SUPABASE_URL,
      anonKey: ANON_KEY,
      serviceRoleKey: SERVICE_KEY
    },
    features: {
      newsEnabled: process.env.ENABLE_NEWS_FEATURE === 'true'
    }
  } as const;
}