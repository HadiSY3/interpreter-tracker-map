
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
import {
  fetchAssignmentsFromDB,
  saveAssignmentToDB,
  updateAssignmentPaymentStatus,
  fetchCategoriesFromDB,
  fetchLocationsFromDB,
  fetchInterpretersFromDB
} from '@/lib/database';

interface DataContextType {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  interpreters: Interpreter[];
  setInterpreters: React.Dispatch<React.SetStateAction<Interpreter[]>>;
  getAssignmentsByInterpreter: (interpreterId: string) => Assignment[];
  deleteCategory: (categoryId: string) => void;
  deleteLocation: (locationId: string) => void;
  isLoading: boolean;
  syncWithDatabase: () => Promise<void>;
  updateAssignmentPaidStatus: (assignmentId: string, paid: boolean) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [interpreters, setInterpreters] = useState<Interpreter[]>(initialInterpreters);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data from database on component mount
  useEffect(() => {
    const loadData = async () => {
      await syncWithDatabase();
    };
    
    loadData();
  }, []);

  // Function to sync with database
  const syncWithDatabase = async () => {
    setIsLoading(true);
    try {
      // Fetch all data from the database
      const [assignmentsData, categoriesData, locationsData, interpretersData] = await Promise.all([
        fetchAssignmentsFromDB(),
        fetchCategoriesFromDB(),
        fetchLocationsFromDB(),
        fetchInterpretersFromDB()
      ]);

      // Update state with fetched data, falling back to initial data if null
      if (categoriesData) setCategories(categoriesData);
      if (locationsData) setLocations(locationsData);
      if (assignmentsData) setAssignments(assignmentsData);
      if (interpretersData) setInterpreters(interpretersData);
      
      toast({
        title: "Daten synchronisiert",
        description: "Die Daten wurden erfolgreich mit der Datenbank synchronisiert."
      });
    } catch (error) {
      console.error("Error syncing with database:", error);
      toast({
        title: "Synchronisierungsfehler",
        description: "Die Daten konnten nicht mit der Datenbank synchronisiert werden. Fallback auf lokale Daten.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update assignment paid status in database and local state
  const updateAssignmentPaidStatus = async (assignmentId: string, paid: boolean) => {
    const success = await updateAssignmentPaymentStatus(assignmentId, paid);
    
    if (success) {
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId ? { ...assignment, paid } : assignment
      ));
      
      toast({
        title: paid ? "Als bezahlt markiert" : "Als unbezahlt markiert",
        description: `Der Einsatz wurde als ${paid ? 'bezahlt' : 'unbezahlt'} markiert.`
      });
    }
  };

  // Helper function to filter assignments by interpreter
  const getAssignmentsByInterpreter = (interpreterId: string) => {
    return assignments.filter(assignment => 
      assignment.interpreter && assignment.interpreter.id === interpreterId
    );
  };

  // Function to safely delete a category
  const deleteCategory = (categoryId: string) => {
    // Check if the category is used in any assignments
    const assignmentsWithCategory = assignments.filter(a => a.category.id === categoryId);
    
    if (assignmentsWithCategory.length > 0) {
      toast({
        title: "Kategorie kann nicht gelöscht werden",
        description: `Diese Kategorie wird in ${assignmentsWithCategory.length} Einsätzen verwendet. Bitte weisen Sie diesen Einsätzen zuerst eine andere Kategorie zu.`,
        variant: "destructive"
      });
      return;
    }
    
    // Delete category if not used
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    toast({
      title: "Kategorie gelöscht",
      description: "Die Kategorie wurde erfolgreich gelöscht."
    });
  };

  // Function to safely delete a location
  const deleteLocation = (locationId: string) => {
    // Check if the location is used in any assignments
    const assignmentsWithLocation = assignments.filter(a => a.location.id === locationId);
    
    if (assignmentsWithLocation.length > 0) {
      toast({
        title: "Ort kann nicht gelöscht werden",
        description: `Dieser Ort wird in ${assignmentsWithLocation.length} Einsätzen verwendet. Bitte weisen Sie diesen Einsätzen zuerst einen anderen Ort zu.`,
        variant: "destructive"
      });
      return;
    }
    
    // Delete location if not used
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
      deleteLocation,
      isLoading,
      syncWithDatabase,
      updateAssignmentPaidStatus
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
