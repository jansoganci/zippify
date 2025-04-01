import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
type KeywordContextType = {
  keywords: string[];
  setKeywords: React.Dispatch<React.SetStateAction<string[]>>;
};

// Create the context with default values
const KeywordContext = createContext<KeywordContextType>({
  keywords: [],
  setKeywords: () => {},
});

// Define props for the provider component
interface KeywordProviderProps {
  children: ReactNode;
}

// Create a provider component
export const KeywordProvider: React.FC<KeywordProviderProps> = ({ children }) => {
  const [keywords, setKeywords] = useState<string[]>([]);

  return (
    <KeywordContext.Provider value={{ keywords, setKeywords }}>
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
