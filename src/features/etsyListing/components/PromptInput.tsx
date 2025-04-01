import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div className="w-full mb-4">
      <label 
        htmlFor="product-description" 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Product Description
      </label>
      <textarea
        id="product-description"
        value={prompt}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows={6}
        placeholder="Enter your product description here..."
      />
    </div>
  );
};

export default PromptInput;
