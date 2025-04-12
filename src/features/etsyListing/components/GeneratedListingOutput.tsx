import React from 'react';
import ReactMarkdown from 'react-markdown';

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
          <ReactMarkdown components={{
            p: ({node, ...props}) => <p className="text-gray-700" {...props} />
          }}>{description}</ReactMarkdown>
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
          <ReactMarkdown components={{
            p: ({node, ...props}) => <p className="text-sm text-gray-600" {...props} />
          }}>{altText}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default GeneratedListingOutput;
