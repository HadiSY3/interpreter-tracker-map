
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Assignment, 
  Category, 
  Location, 
  Interpreter,
  initialCategories, 
  initialLocations, 
  initialAssignments,
  initialInterpreters 
} from '@/lib/types';

interface DataContextType {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  interpreters: Interpreter[];
  setInterpreters: React.Dispatch<React.SetStateAction<Interpreter[]>>;
  // Hilfsfunktion, um Einsätze nach Dolmetscher zu filtern
  getAssignmentsByInterpreter: (interpreterId: string) => Assignment[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [interpreters, setInterpreters] = useState<Interpreter[]>(initialInterpreters);

  // Hilfsfunktion, um Einsätze nach Dolmetscher zu filtern
  const getAssignmentsByInterpreter = (interpreterId: string) => {
    return assignments.filter(assignment => 
      assignment.interpreter && assignment.interpreter.id === interpreterId
    );
  };

  return (
    <DataContext.Provider value={{
      categories,
      setCategories,
      locations,
      setLocations,
      assignments,
      setAssignments,
      interpreters,
      setInterpreters,
      getAssignmentsByInterpreter
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
