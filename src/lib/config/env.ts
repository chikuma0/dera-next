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
    'SUPABASE_SERVICE_ROLE_KEY',
    'PERPLEXITY_API_URL',
    'PERPLEXITY_API_KEY',
    'TRANSLATION_API_URL',
    'TRANSLATION_API_KEY'
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
    },
    perplexity: {
      url: process.env.PERPLEXITY_API_URL as string,
      apiKey: process.env.PERPLEXITY_API_KEY as string
    },
    translation: {
      url: process.env.TRANSLATION_API_URL as string,
      apiKey: process.env.TRANSLATION_API_KEY as string
    }
  };
}