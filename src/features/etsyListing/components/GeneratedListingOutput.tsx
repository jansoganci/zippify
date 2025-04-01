import React from 'react';

interface GeneratedListingOutputProps {
  title: string;
  description: string;
  keywords: string[];
  altText: string;
}

const GeneratedListingOutput: React.FC<GeneratedListingOutputProps> = ({
  title,
  description,
  keywords,
  altText,
}) => {
  return (
    <div className="space-y-4">
      {title && (
        <div className="title-section">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
      )}

      {description && (
        <div className="description-section">
          <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
        </div>
      )}

      {keywords && keywords.length > 0 && (
        <div className="keywords-section">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Keywords:</h3>
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
        </div>
      )}

      {altText && (
        <div className="alt-text-section">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Alt Text:</h3>
          <p className="text-sm text-gray-600">{altText}</p>
        </div>
      )}
    </div>
  );
};

export default GeneratedListingOutput;
