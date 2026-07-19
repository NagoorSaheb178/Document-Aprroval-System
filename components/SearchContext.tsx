"use client";

import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext<{ search: string, setSearch: (s: string) => void }>({ search: '', setSearch: () => {} });

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState('');
  return <SearchContext.Provider value={{ search, setSearch }}>{children}</SearchContext.Provider>;
}

export const useSearch = () => useContext(SearchContext);
