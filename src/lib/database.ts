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
  // Passe die URL entsprechend an, wenn deine PHP API in XAMPP läuft
  return `http://localhost/interpreter-api/${endpoint}.php`;
  
  // If you're hosting the API on a different machine on your network, use its IP:
  // return `http://192.168.1.x/interpreter-api/${endpoint}.php`;
};

// Debug function to test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log("Testing API connection to:", buildApiUrl('get-categories'));
    const response = await fetch(buildApiUrl('get-categories'), {
      method: 'GET',
      // Add a timeout to fail fast in case of connection issues
      signal: AbortSignal.timeout(5000)
    });
    
    console.log("API response status:", response.status);
    return response.ok;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
};

// Generic function to handle fetch errors
const handleFetchError = (error: any, actionName: string) => {
  console.error(`Error ${actionName}:`, error);
  return null;
};

// Assignments API functions
export const fetchAssignmentsFromDB = async (): Promise<Assignment[] | null> => {
  try {
    console.log("Fetching assignments from:", buildApiUrl('get-assignments'));
    const response = await fetch(buildApiUrl('get-assignments'));
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length} assignments from DB`);
    
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
    console.log("Saving assignment to DB:", assignment.id);
    const response = await fetch(buildApiUrl('save-assignment'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignment),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Save assignment result:", result);
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
    console.log("Fetching categories from:", buildApiUrl('get-categories'));
    const response = await fetch(buildApiUrl('get-categories'));
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length} categories from DB`);
    return data;
  } catch (error) {
    return handleFetchError(error, 'Abrufen der Kategorien');
  }
};

export const fetchLocationsFromDB = async (): Promise<Location[] | null> => {
  try {
    console.log("Fetching locations from:", buildApiUrl('get-locations'));
    const response = await fetch(buildApiUrl('get-locations'));
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length} locations from DB`);
    return data;
  } catch (error) {
    return handleFetchError(error, 'Abrufen der Orte');
  }
};

export const fetchInterpretersFromDB = async (): Promise<Interpreter[] | null> => {
  try {
    console.log("Fetching interpreters from:", buildApiUrl('get-interpreters'));
    const response = await fetch(buildApiUrl('get-interpreters'));
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length} interpreters from DB`);
    return data;
  } catch (error) {
    return handleFetchError(error, 'Abrufen der Dolmetscher');
  }
};

// You can add more functions for saving/updating categories, locations, and interpreters as needed
