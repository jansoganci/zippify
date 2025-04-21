import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the Keyword interface
interface Keyword {
  id: string;
  keyword: string;
  popularity: number;
  competition: number;
  trend: "increasing" | "stable" | "declining";
  selected: boolean;
}

// Define the context type
type KeywordContextType = {
  keywords: Keyword[];
  setKeywords: React.Dispatch<React.SetStateAction<Keyword[]>>;
  addKeyword: (keyword: Keyword) => void;
  removeKeyword: (keywordId: string) => void;
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
  const [keywords, setKeywordsState] = useState<Keyword[]>(() => {
    try {
      const storedKeywords = localStorage.getItem(STORAGE_KEY);
      return storedKeywords ? JSON.parse(storedKeywords) : [];
    } catch (error) {
      if (import.meta.env.MODE !== 'production') if (import.meta.env.MODE !== 'production') console.error('Error loading keywords from localStorage:', error);
      return [];
    }
  });
  
  // Create a wrapper function that updates state and localStorage simultaneously
  const setKeywordsWithStorage = (newKeywords: Keyword[] | ((prev: Keyword[]) => Keyword[])) => {
    setKeywordsState(prevKeywords => {
      // Handle both direct value and function updates
      const updatedKeywords = typeof newKeywords === 'function' 
        ? newKeywords(prevKeywords) 
        : newKeywords;
      
      // Immediately save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedKeywords));
        if (import.meta.env.MODE !== 'production') if (import.meta.env.MODE !== 'production') console.log(`Saved ${updatedKeywords.length} keywords to localStorage`);
      } catch (error) {
        if (import.meta.env.MODE !== 'production') if (import.meta.env.MODE !== 'production') console.error('Error saving keywords to localStorage:', error);
      }
      
      return updatedKeywords;
    });
  };
  
  // Load keywords from localStorage when the component mounts
  useEffect(() => {
    try {
      const storedKeywords = localStorage.getItem(STORAGE_KEY);
      if (storedKeywords) {
        const parsedKeywords = JSON.parse(storedKeywords);
        if (Array.isArray(parsedKeywords) && parsedKeywords.length > 0) {
          setKeywordsWithStorage(parsedKeywords);
          if (import.meta.env.MODE !== 'production') if (import.meta.env.MODE !== 'production') console.log(`Loaded ${parsedKeywords.length} keywords from localStorage on mount`);
        }
      }
    } catch (error) {
      if (import.meta.env.MODE !== 'production') if (import.meta.env.MODE !== 'production') console.error('Error loading keywords from localStorage on mount:', error);
    }
  }, []);

  // Helper function to add a keyword if it doesn't already exist
  const addKeyword = (keyword: Keyword) => {
    // Check if keyword with same id already exists
    if (keyword && !keywords.some(k => k.id === keyword.id)) {
      setKeywordsWithStorage(prev => [...prev, keyword]);
    }
  };

  // Helper function to remove a keyword by id
  const removeKeyword = (keywordId: string) => {
    setKeywordsWithStorage(prev => prev.filter(k => k.id !== keywordId));
  };

  // Helper function to clear all keywords
  const clearKeywords = () => {
    setKeywordsWithStorage([]);
  };

  return (
    <KeywordContext.Provider value={{ 
      keywords, 
      setKeywords: setKeywordsWithStorage, 
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
