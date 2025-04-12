import React, { useState } from 'react';
import { useSeoKeywords } from '../context/KeywordContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt }) => {
  const { addKeyword } = useSeoKeywords();
  const [newKeyword, setNewKeyword] = useState('');

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewKeyword(e.target.value);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      addKeyword(newKeyword.trim());
      setNewKeyword('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newKeyword.trim()) {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="w-full mb-4 space-y-4">
      <div>
        <textarea
          aria-label="Product Description"
          id="product-description"
          value={prompt}
          onChange={handlePromptChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={6}
          placeholder="Enter your product description here..."
        />
      </div>
      
      <div>
        <label 
          htmlFor="additional-keyword" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Add Additional Keyword
        </label>
        <div className="flex gap-2">
          <Input
            id="additional-keyword"
            value={newKeyword}
            onChange={handleKeywordChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter a new keyword and press Enter"
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim()}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
