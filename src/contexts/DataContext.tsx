
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
  syncWithDatabase: () => Promise<boolean>;
  updateAssignmentPaidStatus: (assignmentId: string, paid: boolean) => Promise<void>;
  saveAssignment: (assignment: Assignment) => Promise<boolean>;
  saveCategory: (category: Category) => Promise<boolean>;
  saveInterpreter: (interpreter: Interpreter) => Promise<boolean>;
  saveLocation: (location: Location) => Promise<boolean>;
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
  const syncWithDatabase = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log("Starte Datenbankverbindung...");
      
      // Fetch all data from the database
      const [assignmentsData, categoriesData, locationsData, interpretersData] = await Promise.all([
        fetchAssignmentsFromDB(),
        fetchCategoriesFromDB(),
        fetchLocationsFromDB(),
        fetchInterpretersFromDB()
      ]);

      console.log("DB-Daten erhalten:", {
        assignments: assignmentsData ? assignmentsData.length : 0,
        categories: categoriesData ? categoriesData.length : 0, 
        locations: locationsData ? locationsData.length : 0,
        interpreters: interpretersData ? interpretersData.length : 0
      });

      let dataUpdated = false;

      // Update state with fetched data, falling back to initial data if null
      if (categoriesData) {
        setCategories(categoriesData.length > 0 ? categoriesData : categories);
        dataUpdated = dataUpdated || categoriesData.length > 0;
      }
      
      if (locationsData) {
        setLocations(locationsData.length > 0 ? locationsData : locations);
        dataUpdated = dataUpdated || locationsData.length > 0;
      }
      
      if (assignmentsData) {
        setAssignments(assignmentsData.length > 0 ? assignmentsData : assignments);
        dataUpdated = dataUpdated || assignmentsData.length > 0;
      }
      
      if (interpretersData) {
        setInterpreters(interpretersData.length > 0 ? interpretersData : interpreters);
        dataUpdated = dataUpdated || interpretersData.length > 0;
      }
      
      return true;
    } catch (error) {
      console.error("Error syncing with database:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Save assignment to database and update local state
  const saveAssignment = async (assignment: Assignment): Promise<boolean> => {
    try {
      const success = await saveAssignmentToDB(assignment);
      
      if (success) {
        // Update local state
        setAssignments(prev => {
          const index = prev.findIndex(a => a.id === assignment.id);
          if (index >= 0) {
            return [...prev.slice(0, index), assignment, ...prev.slice(index + 1)];
          } else {
            return [...prev, assignment];
          }
        });
        
        toast({
          title: "Einsatz gespeichert",
          description: "Der Einsatz wurde erfolgreich in der Datenbank gespeichert."
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast({
        title: "Fehler beim Speichern",
        description: `Der Einsatz konnte nicht gespeichert werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
      return false;
    }
  };

  // Todo: Implement these save methods to sync with database
  const saveCategory = async (category: Category): Promise<boolean> => {
    // TODO: Implement saving category to database
    try {
      // For now, just update the local state
      setCategories(prev => {
        const index = prev.findIndex(c => c.id === category.id);
        if (index >= 0) {
          return [...prev.slice(0, index), category, ...prev.slice(index + 1)];
        } else {
          return [...prev, category];
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error saving category:", error);
      return false;
    }
  };

  const saveInterpreter = async (interpreter: Interpreter): Promise<boolean> => {
    // TODO: Implement saving interpreter to database
    try {
      // For now, just update the local state
      setInterpreters(prev => {
        const index = prev.findIndex(i => i.id === interpreter.id);
        if (index >= 0) {
          return [...prev.slice(0, index), interpreter, ...prev.slice(index + 1)];
        } else {
          return [...prev, interpreter];
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error saving interpreter:", error);
      return false;
    }
  };

  const saveLocation = async (location: Location): Promise<boolean> => {
    // TODO: Implement saving location to database
    try {
      // For now, just update the local state
      setLocations(prev => {
        const index = prev.findIndex(l => l.id === location.id);
        if (index >= 0) {
          return [...prev.slice(0, index), location, ...prev.slice(index + 1)];
        } else {
          return [...prev, location];
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error saving location:", error);
      return false;
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
      updateAssignmentPaidStatus,
      saveAssignment,
      saveCategory,
      saveInterpreter,
      saveLocation
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
