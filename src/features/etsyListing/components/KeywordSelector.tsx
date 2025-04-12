import React from 'react';
import { useSeoKeywords } from '../context/KeywordContext';
import { X } from 'lucide-react';

const KeywordSelector: React.FC = () => {
  const { keywords, removeKeyword } = useSeoKeywords();

  return (
    <div>
      {keywords.length > 0 && (
        <h4 className="text-sm font-medium mb-2">
          Selected Keywords ({keywords.length}):
        </h4>
      )}
      
      {keywords.length === 0 ? (
        <div className="text-sm text-gray-500 italic">
          No keywords selected. You can add keywords above or import them from the SEO Keyword Analysis page.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <div 
              key={`${keyword}-${index}`}
              className="bg-muted text-sm px-3 py-1 rounded-full text-gray-700 flex items-center"
            >
              <span>{keyword}</span>
              <button 
                onClick={() => removeKeyword(keyword)}
                className="ml-1 p-0.5 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                title="Remove keyword"
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeywordSelector;
