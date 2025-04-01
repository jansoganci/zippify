import React from 'react';
import { useSeoKeywords } from '../context/KeywordContext';

const KeywordSelector: React.FC = () => {
  const { keywords } = useSeoKeywords();

  if (keywords.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No keywords selected
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword, index) => (
        <div 
          key={`${keyword}-${index}`}
          className="bg-gray-100 text-sm px-3 py-1 rounded-full text-gray-700"
        >
          {keyword}
        </div>
      ))}
    </div>
  );
};

export default KeywordSelector;
