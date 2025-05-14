async function refreshNews() {
  const url = 'http://localhost:3000/api/news/cron';
  const CRON_SECRET = process.env.CRON_SECRET;
  
  if (!CRON_SECRET) {
    console.error('Error: CRON_SECRET is not set in environment variables');
    process.exit(1);
  }
  
  try {
    console.log(`Sending request to: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('News refresh successful:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Failed to refresh news:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

refreshNews();