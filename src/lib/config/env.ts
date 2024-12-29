export function validateEnv() {
  // Add console.log to debug
  console.log('Checking env variables:', {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    service: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missing = required.filter(key => 
    !process.env[key] || process.env[key] === ''
  );

  if (missing.length > 0) {
    console.error('Missing env variables:', missing);
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY as string
    }
  };
}