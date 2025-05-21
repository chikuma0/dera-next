async function refreshNews() {
  try {
    const response = await fetch(
      'http://localhost:3000/api/news?refresh=true'
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('News refresh result:', result);
  } catch (error) {
    console.error('Failed to refresh news:', error);
  }
}

refreshNews();
