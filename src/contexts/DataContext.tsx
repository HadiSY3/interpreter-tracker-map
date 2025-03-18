
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Assignment, Category, Location, initialCategories, initialLocations, initialAssignments } from '@/lib/types';

interface DataContextType {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

  return (
    <DataContext.Provider value={{
      categories,
      setCategories,
      locations,
      setLocations,
      assignments,
      setAssignments
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
