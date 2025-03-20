import React from 'react';
import { Select } from '@chakra-ui/react';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' }
];

export const LanguageSwitcher = ({ currentLanguage, onLanguageChange }) => {
  return (
    <Select
      value={currentLanguage}
      onChange={(e) => onLanguageChange(e.target.value)}
      size="sm"
      variant="ghost"
      width="auto"
      borderRadius="md"
      _hover={{ bg: 'surfaceHover' }}
    >
      {languages.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </Select>
  );
};
