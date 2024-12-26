'use client';

export function EnvTest() {
  return (
    <div className="hidden">
      Supabase URL exists: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'yes' : 'no'}
    </div>
  );
} 