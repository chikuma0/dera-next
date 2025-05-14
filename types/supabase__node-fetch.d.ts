declare module '@supabase/node-fetch' {
  const fetch: typeof globalThis.fetch;
  export default fetch;
} 