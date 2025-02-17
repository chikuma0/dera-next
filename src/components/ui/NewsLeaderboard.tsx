import { NewsItem } from '@/types/news';
import { useTranslation } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface NewsLeaderboardProps {
  items: NewsItem[];
}

export function NewsLeaderboard({ items }: NewsLeaderboardProps) {
  const { translate } = useTranslation();

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return translate('common.invalidDate');
    }

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleString(undefined, options);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-black/40 border-4 border-[#4a9eff] rounded-lg p-6 font-mono relative overflow-hidden retro-shadow">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzRhOWVmZjIwIi8+PC9zdmc+')] opacity-20" />
        
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#4a9eff] rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#4a9eff] rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#4a9eff] rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#4a9eff] rounded-br-lg" />
        
        {/* Header */}
        <div className="relative">
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <h2 className="text-[#4a9eff] text-3xl font-bold pixel-font relative z-10 animate-pulse">
                TOP STORIES
              </h2>
              <div className="absolute -inset-1 bg-[#4a9eff]/10 blur-sm" />
            </div>
            <div className="text-yellow-400 text-sm mt-3 pixel-font blink">
              UPDATED: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-4 relative">
          {/* Scanline Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4a9eff]/5 to-transparent animate-scan" />
            <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,_transparent_95%,_#4a9eff10_100%)] bg-[length:100%_3px] animate-scan" style={{ backgroundRepeat: 'repeat-y' }} />
          </div>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-black/60 border-2 border-[#4a9eff] rounded p-4 hover:bg-black/80 transition-colors"
            >
              <div className="flex items-start gap-4 relative overflow-hidden group">
                {/* Rank Number */}
                <div className="flex-shrink-0 relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#4a9eff] to-[#2d5eff] rounded-lg flex items-center justify-center shadow-lg border-2 border-[#4a9eff]/50 animate-glow">
                    <span className="text-black text-2xl font-bold pixel-font">{index + 1}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Rank Number */}
                    <div className="text-[#4a9eff]/70 text-xs pixel-font">
                      #{index + 1}
                    </div>
                    
                    {/* Time Indicator */}
                    <div className="bg-[#4a9eff]/20 px-2 py-1 rounded-full">
                      <span className="text-[#4a9eff] text-xs">{formatDate(item.published_date)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4a9eff] hover:text-blue-300 font-bold block mb-2 group-hover:translate-x-2 transition-transform"
                  >
                    {item.title}
                  </a>
                  
                  {/* Source */}
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm pixel-font">{item.source}</span>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#4a9eff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* Retro decorative elements */}
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#4a9eff]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#4a9eff]" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}