import React from 'react';
import { Metadata } from 'next';
import { NewsService, NewsItem } from '@/lib/services/newsService';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'News Sources Admin | DERA',
  description: 'Manage news sources for the AI news aggregation platform',
};

// This is a server component since it directly fetches data
export default async function NewsSourcesAdmin() {
  // This would typically include authentication checks in a real app
  
  // Get recent news items
  const newsService = new NewsService();
  // Get recent news items by source (empty string to get all sources)
  const recentNews = await newsService.getNewsBySource('') || [];
  
  if (!recentNews.length) {
    notFound();
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            News Sources Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage the sources used for the AI news aggregation system.
          </p>
        </div>
        
        <div className="mb-6 flex justify-end">
          <Link 
            href="/admin/news-sources/add" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Add New Source
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentNews.map((newsItem: NewsItem) => (
                <tr key={newsItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {newsItem.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {newsItem.summary || 'No summary available'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {newsItem.source || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {newsItem.published_date ? new Date(newsItem.published_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a 
                      href={newsItem.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      View
                    </a>
                    <a 
                      href={`/admin/news/edit/${newsItem.id}`} 
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}