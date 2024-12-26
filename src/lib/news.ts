export async function fetchNews() {
    // Your Supabase fetching code here
    const news = await supabase
      .from('news')
      .select('*')
      .order('relevanceScore', { ascending: false })
      .limit(10);
  
    return processNewsItems(news);
  }
  
  function processNewsItems(news: NewsItem[]) {
    return news.map(item => ({
      ...item,
      displayTitle: `${item.title} (${item.source})`
    }));
  }