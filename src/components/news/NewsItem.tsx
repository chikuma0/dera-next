import { NewsItem } from '@/types/news';

interface NewsItemCardProps {
  item: NewsItem;
}

export function NewsItemCard({ item }: NewsItemCardProps) {
  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-black/20">
      <h3 className="text-lg font-semibold mb-2">
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          {item.title}
        </a>
      </h3>
      {item.summary && (
        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
          {item.summary}
        </p>
      )}
      <div className="text-sm text-gray-500">
        <span>{item.source}</span>
        <span className="mx-2">•</span>
        <span>{new Date(item.publishedDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}