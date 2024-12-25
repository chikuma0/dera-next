'use client';

export class NewsService {
  async fetchAllNews() {
    try {
      // Use absolute URL based on window.location
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/news`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
}
