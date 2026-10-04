import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface SearchCriteria {
  date: string | null;
  cityId: string | null;
  guests: number | null;
  budget: number | null;
  searchType: 'venue' | 'singer';
}

interface SearchContextType {
  criteria: SearchCriteria;
  setDate: (date: string | null) => void;
  setCityId: (cityId: string | null) => void;
  setGuests: (guests: number | null) => void;
  setBudget: (budget: number | null) => void;
  setSearchType: (type: 'venue' | 'singer') => void;
  setCriteria: (criteria: Partial<SearchCriteria>) => void;
  clearCriteria: () => void;
}

const defaultCriteria: SearchCriteria = {
  date: null,
  cityId: null,
  guests: null,
  budget: null,
  searchType: 'venue',
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [criteria, setCriteriaState] = useState<SearchCriteria>(defaultCriteria);

  const setDate = useCallback((date: string | null) => {
    setCriteriaState((prev) => ({ ...prev, date }));
  }, []);

  const setCityId = useCallback((cityId: string | null) => {
    setCriteriaState((prev) => ({ ...prev, cityId }));
  }, []);

  const setGuests = useCallback((guests: number | null) => {
    setCriteriaState((prev) => ({ ...prev, guests }));
  }, []);

  const setBudget = useCallback((budget: number | null) => {
    setCriteriaState((prev) => ({ ...prev, budget }));
  }, []);

  const setSearchType = useCallback((searchType: 'venue' | 'singer') => {
    setCriteriaState((prev) => ({ ...prev, searchType }));
  }, []);

  const setCriteria = useCallback((partial: Partial<SearchCriteria>) => {
    setCriteriaState((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearCriteria = useCallback(() => {
    setCriteriaState(defaultCriteria);
  }, []);

  return (
    <SearchContext.Provider
      value={{ criteria, setDate, setCityId, setGuests, setBudget, setSearchType, setCriteria, clearCriteria }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchCriteria() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchCriteria must be used within SearchProvider');
  }
  return context;
}
