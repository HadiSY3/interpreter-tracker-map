
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
import { toast } from '@/components/ui/use-toast';

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
  // Neue Funktionen zum sicheren Löschen von Kategorien und Orten
  deleteCategory: (categoryId: string) => void;
  deleteLocation: (locationId: string) => void;
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

  // Funktion zum sicheren Löschen einer Kategorie
  const deleteCategory = (categoryId: string) => {
    // Prüfen, ob die Kategorie in Einsätzen verwendet wird
    const assignmentsWithCategory = assignments.filter(a => a.category.id === categoryId);
    
    if (assignmentsWithCategory.length > 0) {
      toast({
        title: "Kategorie kann nicht gelöscht werden",
        description: `Diese Kategorie wird in ${assignmentsWithCategory.length} Einsätzen verwendet. Bitte weisen Sie diesen Einsätzen zuerst eine andere Kategorie zu.`,
        variant: "destructive"
      });
      return;
    }
    
    // Kategorie löschen, wenn sie nicht verwendet wird
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    toast({
      title: "Kategorie gelöscht",
      description: "Die Kategorie wurde erfolgreich gelöscht."
    });
  };

  // Funktion zum sicheren Löschen eines Ortes
  const deleteLocation = (locationId: string) => {
    // Prüfen, ob der Ort in Einsätzen verwendet wird
    const assignmentsWithLocation = assignments.filter(a => a.location.id === locationId);
    
    if (assignmentsWithLocation.length > 0) {
      toast({
        title: "Ort kann nicht gelöscht werden",
        description: `Dieser Ort wird in ${assignmentsWithLocation.length} Einsätzen verwendet. Bitte weisen Sie diesen Einsätzen zuerst einen anderen Ort zu.`,
        variant: "destructive"
      });
      return;
    }
    
    // Ort löschen, wenn er nicht verwendet wird
    setLocations(prev => prev.filter(l => l.id !== locationId));
    toast({
      title: "Ort gelöscht",
      description: "Der Ort wurde erfolgreich gelöscht."
    });
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
      getAssignmentsByInterpreter,
      deleteCategory,
      deleteLocation
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
