import { NewsItem } from '@/types/news';
import { useTranslation } from '@/contexts/LanguageContext';

interface NewsItemCardProps {
  item: NewsItem;
}

export function NewsItemCard({ item }: NewsItemCardProps) {
  const { translate } = useTranslation();

  // Format date based on language
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return translate('common.invalidDate');
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleString(item.language === 'ja' ? 'ja-JP' : 'en-US', options);
  };

  // Ensure we have a valid date string for the datetime attribute
  const getISOString = (dateString: string | Date) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString();
  };

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
        <time dateTime={getISOString(item.published_date)}>
          {formatDate(item.published_date)}
        </time>
      </div>
    </div>
  );
}