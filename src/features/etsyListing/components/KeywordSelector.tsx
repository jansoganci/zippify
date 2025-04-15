import React from 'react';
import { useSeoKeywords } from '../context/KeywordContext';
import { X, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

// Import the Keyword interface type from KeywordContext
interface Keyword {
  id: string;
  keyword: string;
  popularity?: number;
  competition?: number;
  trend?: "increasing" | "stable" | "declining";
  selected?: boolean;
}

const KeywordSelector: React.FC = () => {
  const { keywords, removeKeyword } = useSeoKeywords();

  return (
    <div>
      
      {keywords.length === 0 ? (
        <div className="text-sm text-gray-500 italic flex items-center gap-2 border border-gray-200 rounded-md p-3">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <span>No keywords selected.</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => {
            // Safely access keyword properties with fallbacks
            const keywordId = keyword?.id || `keyword-${index}`;
            const keywordText = keyword?.keyword || 'Unknown keyword';
            const popularity = typeof keyword?.popularity === 'number' ? 
              Number(keyword.popularity).toFixed(1) : '?';
            const competition = typeof keyword?.competition === 'number' ? 
              Number(keyword.competition).toFixed(1) : '?';
            const trend = keyword?.trend || 'stable';
            
            return (
              <div 
                key={keywordId}
                className="bg-muted px-3 py-1 rounded-lg text-gray-700 flex items-center group hover:bg-gray-200 transition-colors"
              >
                <span className="text-sm font-medium mr-2">
                  {keywordText}
                </span>
                <button 
                  onClick={() => removeKeyword(keywordId)}
                  className="ml-auto p-0.5 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  title="Remove keyword"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KeywordSelector;
