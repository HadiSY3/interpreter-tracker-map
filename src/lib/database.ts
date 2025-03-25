
import { Assignment, Category, Location, Interpreter } from './types';

// Helper function to handle fetch errors
const handleFetchError = (error: any, errorMessage: string) => {
  console.error(errorMessage, error);
  
  // Extract more detailed error information if available
  let errorDetails = '';
  if (error instanceof Response) {
    errorDetails = `Server responded with status: ${error.status}`;
  } else if (error instanceof Error) {
    errorDetails = error.message;
  }
  
  if (errorDetails) {
    console.error('Error details:', errorDetails);
  }
  
  return null;
};

// Function to test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    // Log request attempt for debugging
    console.log("Testing API connection at:", window.location.origin + '/interpreter-app/interpreter-api/get-categories.php');
    
    // Try to fetch categories as a simple test
    const response = await fetch('/interpreter-app/interpreter-api/get-categories.php');
    
    if (!response.ok) {
      console.error("API test failed with status:", response.status);
      // Try to log response text for debugging
      const text = await response.text();
      console.error("Response text:", text);
    }
    
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

// Function to save an assignment to the database
export const saveAssignmentToDB = async (assignment: Assignment): Promise<boolean> => {
  try {
    // Convert dates to strings for transmission
    const assignmentData = {
      ...assignment,
      startTime: assignment.startTime.toISOString(),
      endTime: assignment.endTime.toISOString()
    };

    // Add the correct base path to the API URL
    const response = await fetch('/interpreter-app/interpreter-api/save-assignment.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    handleFetchError(error, 'Error saving assignment:');
    throw error; // Re-throw to allow component to handle the error
  }
};

// Function to fetch assignments from the database
export const fetchAssignmentsFromDB = async (): Promise<Assignment[] | null> => {
  try {
    console.log("Fetching assignments from:", window.location.origin + '/interpreter-app/interpreter-api/get-assignments.php');
    
    // Add the correct base path to the API URL
    const response = await fetch('/interpreter-app/interpreter-api/get-assignments.php');
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status} - ${await response.text()}`);
    }
    
    const data = await response.json();
    
    // Convert string dates back to Date objects
    return data.map((assignment: any) => ({
      ...assignment,
      startTime: new Date(assignment.startTime),
      endTime: new Date(assignment.endTime)
    }));
  } catch (error) {
    handleFetchError(error, 'Error Abrufen der Einsätze:');
    return null;
  }
};

// Function to update assignment payment status
export const updateAssignmentPaymentStatus = async (assignmentId: string, paid: boolean): Promise<boolean> => {
  try {
    // Add the correct base path to the API URL
    const response = await fetch('/interpreter-app/interpreter-api/update-payment-status.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: assignmentId, paid }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status} - ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    handleFetchError(error, 'Error updating payment status:');
    return false;
  }
};

// Function to fetch categories from the database
export const fetchCategoriesFromDB = async (): Promise<Category[] | null> => {
  try {
    console.log("Fetching categories from:", window.location.origin + '/interpreter-app/interpreter-api/get-categories.php');
    
    // Add the correct base path to the API URL
    const response = await fetch('/interpreter-app/interpreter-api/get-categories.php');
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status} - ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    handleFetchError(error, 'Error Abrufen der Kategorien:');
    return null;
  }
};

// Function to fetch locations from the database
export const fetchLocationsFromDB = async (): Promise<Location[] | null> => {
  try {
    console.log("Fetching locations from:", window.location.origin + '/interpreter-app/interpreter-api/get-locations.php');
    
    // Add the correct base path to the API URL
    const response = await fetch('/interpreter-app/interpreter-api/get-locations.php');
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status} - ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    handleFetchError(error, 'Error Abrufen der Orte:');
    return null;
  }
};

// Function to fetch interpreters from the database
export const fetchInterpretersFromDB = async (): Promise<Interpreter[] | null> => {
  try {
    console.log("Fetching interpreters from:", window.location.origin + '/interpreter-app/interpreter-api/get-interpreters.php');
    
    // Add the correct base path to the API URL
    const response = await fetch('/interpreter-app/interpreter-api/get-interpreters.php');
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status} - ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    handleFetchError(error, 'Error Abrufen der Dolmetscher:');
    return null;
  }
};
