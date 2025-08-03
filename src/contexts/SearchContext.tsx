import React, { createContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  handleSearch: (term: string) => void;
  handleGlobalSearch: (e: React.FormEvent) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback((term: string) => {
    if (term.trim()) {
      setSearchTerm(term);
      navigate(`/help?search=${encodeURIComponent(term)}`);
      setIsSearchOpen(false);
    }
  }, [navigate]);

  const handleGlobalSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  }, [searchTerm, handleSearch]);

  const value = {
    searchTerm,
    setSearchTerm,
    isSearchOpen,
    setIsSearchOpen,
    handleSearch,
    handleGlobalSearch,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}; 