import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the context type
type KeywordContextType = {
  keywords: string[];
  setKeywords: React.Dispatch<React.SetStateAction<string[]>>;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  clearKeywords: () => void;
};

// Local storage key
const STORAGE_KEY = 'zippify_selected_keywords';

// Create the context with default values
const KeywordContext = createContext<KeywordContextType>({
  keywords: [],
  setKeywords: () => {},
  addKeyword: () => {},
  removeKeyword: () => {},
  clearKeywords: () => {},
});

// Define props for the provider component
interface KeywordProviderProps {
  children: ReactNode;
}

// Create a provider component
export const KeywordProvider: React.FC<KeywordProviderProps> = ({ children }) => {
  // Initialize state from localStorage if available
  const [keywords, setKeywords] = useState<string[]>(() => {
    try {
      const storedKeywords = localStorage.getItem(STORAGE_KEY);
      return storedKeywords ? JSON.parse(storedKeywords) : [];
    } catch (error) {
      console.error('Error loading keywords from localStorage:', error);
      return [];
    }
  });

  // Persist to localStorage whenever keywords change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
      console.log(`Saved ${keywords.length} keywords to localStorage`);
    } catch (error) {
      console.error('Error saving keywords to localStorage:', error);
    }
  }, [keywords]);
  
  // Load keywords from localStorage when the component mounts
  useEffect(() => {
    try {
      const storedKeywords = localStorage.getItem(STORAGE_KEY);
      if (storedKeywords) {
        const parsedKeywords = JSON.parse(storedKeywords);
        if (Array.isArray(parsedKeywords) && parsedKeywords.length > 0) {
          setKeywords(parsedKeywords);
          console.log(`Loaded ${parsedKeywords.length} keywords from localStorage on mount`);
        }
      }
    } catch (error) {
      console.error('Error loading keywords from localStorage on mount:', error);
    }
  }, []);

  // Helper function to add a keyword if it doesn't already exist
  const addKeyword = (keyword: string) => {
    if (keyword && !keywords.includes(keyword)) {
      setKeywords(prev => [...prev, keyword]);
    }
  };

  // Helper function to remove a keyword
  const removeKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
  };

  // Helper function to clear all keywords
  const clearKeywords = () => {
    setKeywords([]);
  };

  return (
    <KeywordContext.Provider value={{ 
      keywords, 
      setKeywords, 
      addKeyword, 
      removeKeyword, 
      clearKeywords 
    }}>
      {children}
    </KeywordContext.Provider>
  );
};

// Create a custom hook for using the keywords context
export const useSeoKeywords = () => {
  const context = useContext(KeywordContext);
  
  if (!context) {
    throw new Error('useSeoKeywords must be used within a KeywordProvider');
  }
  
  return context;
};

export default KeywordContext;
