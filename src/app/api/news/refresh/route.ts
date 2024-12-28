import { fetchAndStoreNews } from '@/lib/news/fetcher';
import { validateEnv } from '@/lib/config/env';

export async function POST(request: Request) {
  try {
    // Validate API key if needed
    const env = validateEnv();
    
    // Fetch both English and Japanese news
    await Promise.all([
      fetchAndStoreNews('en'),
      fetchAndStoreNews('ja')
    ]);

    return new Response('News refreshed successfully', { status: 200 });
  } catch (error) {
    console.error('Error refreshing news:', error);
    return new Response('Error refreshing news', { status: 500 });
  }
} 