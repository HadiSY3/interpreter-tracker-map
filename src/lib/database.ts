
import { Assignment, Category, Location, Interpreter } from './types';
import { toast } from '@/components/ui/use-toast';

// Database configuration
const DB_CONFIG = {
  host: 'localhost',  // Change if your MySQL server is on a different machine
  database: 'interpreter_tracker', // The name of your database
  port: 3306, // Default MySQL port
  // You'll need to create a user with proper permissions in your MySQL setup
  user: 'interpreter_user',
  password: 'your_secure_password'
};

// Helper function to build API URLs
const buildApiUrl = (endpoint: string): string => {
  // For local development on the same machine
  return `http://localhost/interpreter-api/${endpoint}.php`;
  
  // If you're hosting the API on a different machine on your network, use its IP:
  // return `http://192.168.1.x/interpreter-api/${endpoint}.php`;
};

// Generic function to handle fetch errors
const handleFetchError = (error: any, actionName: string) => {
  console.error(`Error ${actionName}:`, error);
  toast({
    title: `Fehler beim ${actionName}`,
    description: `Bitte überprüfen Sie Ihre Datenbankverbindung. Details: ${error.message}`,
    variant: "destructive"
  });
  return null;
};

// Assignments API functions
export const fetchAssignmentsFromDB = async (): Promise<Assignment[] | null> => {
  try {
    const response = await fetch(buildApiUrl('get-assignments'));
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    const data = await response.json();
    
    // Transform dates from strings to Date objects
    const assignments = data.map((assignment: any) => ({
      ...assignment,
      startTime: new Date(assignment.startTime),
      endTime: new Date(assignment.endTime)
    }));
    
    return assignments;
  } catch (error) {
    return handleFetchError(error, 'Abrufen der Einsätze');
  }
};

export const saveAssignmentToDB = async (assignment: Assignment): Promise<boolean> => {
  try {
    const response = await fetch(buildApiUrl('save-assignment'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignment),
    });
    
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    return true;
  } catch (error) {
    handleFetchError(error, 'Speichern des Einsatzes');
    return false;
  }
};

export const updateAssignmentPaymentStatus = async (assignmentId: string, paid: boolean): Promise<boolean> => {
  try {
    const response = await fetch(buildApiUrl('update-payment-status'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: assignmentId, paid }),
    });
    
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    return true;
  } catch (error) {
    handleFetchError(error, 'Aktualisieren des Zahlungsstatus');
    return false;
  }
};

// Similar functions for categories, locations, and interpreters
export const fetchCategoriesFromDB = async (): Promise<Category[] | null> => {
  try {
    const response = await fetch(buildApiUrl('get-categories'));
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'Abrufen der Kategorien');
  }
};

export const fetchLocationsFromDB = async (): Promise<Location[] | null> => {
  try {
    const response = await fetch(buildApiUrl('get-locations'));
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'Abrufen der Orte');
  }
};

export const fetchInterpretersFromDB = async (): Promise<Interpreter[] | null> => {
  try {
    const response = await fetch(buildApiUrl('get-interpreters'));
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'Abrufen der Dolmetscher');
  }
};

// You can add more functions for saving/updating categories, locations, and interpreters as needed
