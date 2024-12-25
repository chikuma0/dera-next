export class NewsService {
  async fetchAllNews() {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
}
