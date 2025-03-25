
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
  // Die URL wurde angepasst für XAMPP-Deployment
  return `${window.location.protocol}//${window.location.hostname}/interpreter-api/${endpoint}.php`;
};

// Debug function to test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const apiUrl = buildApiUrl('get-categories');
    console.log("Testing API connection to:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      // Add a timeout to fail fast in case of connection issues
      signal: AbortSignal.timeout(5000),
      // Disable caching for test requests
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log("API response status:", response.status);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log("API connection successful, received data:", data);
        return true;
      } catch (jsonError) {
        console.error("API returned invalid JSON:", jsonError);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
};

// Generic function to handle fetch errors
const handleFetchError = (error: any, actionName: string) => {
  console.error(`Error ${actionName}:`, error);
  
  // Provide more detailed error information
  let errorDetails = '';
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    errorDetails = 'Netzwerkfehler: Stellen Sie sicher, dass XAMPP läuft und die PHP-API erreichbar ist.';
  } else if (error instanceof Error) {
    errorDetails = error.message;
  }
  
  toast({
    title: `Fehler beim ${actionName}`,
    description: errorDetails || 'Ein unbekannter Fehler ist aufgetreten.',
    variant: "destructive"
  });
  
  return null;
};

// Assignments API functions
export const fetchAssignmentsFromDB = async (): Promise<Assignment[] | null> => {
  try {
    const apiUrl = buildApiUrl('get-assignments');
    console.log("Fetching assignments from:", apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`Server responded with status: ${response.status} - ${errorText}`);
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
      throw new Error(`Server responded with status: ${response.status} - ${errorText}`);
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
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with status: ${response.status} - ${errorText}`);
    }
    return true;
  } catch (error) {
    handleFetchError(error, 'Aktualisieren des Zahlungsstatus');
    return false;
  }
};

// Similar functions for categories, locations, and interpreters
export const fetchCategoriesFromDB = async (): Promise<Category[] | null> => {
  try {
    const apiUrl = buildApiUrl('get-categories');
    console.log("Fetching categories from:", apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`Server responded with status: ${response.status} - ${errorText}`);
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
    const apiUrl = buildApiUrl('get-locations');
    console.log("Fetching locations from:", apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`Server responded with status: ${response.status} - ${errorText}`);
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
    const apiUrl = buildApiUrl('get-interpreters');
    console.log("Fetching interpreters from:", apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      console.error(`Server responded with status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      throw new Error(`Server responded with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length} interpreters from DB`);
    return data;
  } catch (error) {
    return handleFetchError(error, 'Abrufen der Dolmetscher');
  }
};

// You can add more functions for saving/updating categories, locations, and interpreters as needed
