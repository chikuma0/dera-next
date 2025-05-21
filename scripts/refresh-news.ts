#!/usr/bin/env node

async function refreshNews(language: 'en' | 'ja' = 'en') {
  try {
    const baseUrl = process.env.VERCEL_URL ?? 'http://localhost:3000';
    const url = `${baseUrl.replace(/\/?$/, '')}/api/news?refresh=true&language=${language}`;
    const response = await fetch(url, { method: 'GET' });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.text();
    console.log('News refresh result:', result);
  } catch (error) {
    console.error('Failed to refresh news:', error);
  }
}

const [, , langArg] = process.argv;
refreshNews((langArg === 'ja' ? 'ja' : 'en')).catch((err) => {
  console.error(err);
  process.exit(1);
});
