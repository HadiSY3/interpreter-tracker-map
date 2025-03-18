
export interface Assignment {
  id: string;
  clientName: string;
  location: Location;
  category: Category;
  startTime: Date;
  endTime: Date;
  notes?: string;
  interpreter?: Interpreter; // Optionales Feld für den Dolmetscher
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  visitCount: number;
}

export interface Category {
  id: string;
  name: string;
  hourlyRate: number;
  minuteRate: number;
}

// Neuer Typ für Dolmetscher
export interface Interpreter {
  id: string;
  name: string;
  email: string;
  phone?: string;
  languages?: string[];
  assignmentCount?: number;
}

// Initial data for locations - now empty
export const initialLocations: Location[] = [];

// Initial data for categories - now empty
export const initialCategories: Category[] = [];

// Initial data for interpreters - with two example interpreters
export const initialInterpreters: Interpreter[] = [
  {
    id: "int-1",
    name: "Thomas Schmidt",
    email: "thomas.schmidt@example.com",
    phone: "+49123456789",
    languages: ["Deutsch", "Englisch", "Französisch"],
    assignmentCount: 0
  },
  {
    id: "int-2",
    name: "Müller, Anna",
    email: "anna.mueller@example.com",
    phone: "+49987654321",
    languages: ["Deutsch", "Spanisch", "Italienisch"],
    assignmentCount: 0
  }
];

// Initial assignments - now empty
export const initialAssignments: Assignment[] = [];

// Calculate earnings from an assignment
export const calculateEarnings = (assignment: Assignment): number => {
  const durationMs = assignment.endTime.getTime() - assignment.startTime.getTime();
  const durationMinutes = durationMs / (1000 * 60);
  return parseFloat((durationMinutes * assignment.category.minuteRate).toFixed(2));
};

// Calculate total duration in minutes
export const calculateDuration = (assignment: Assignment): number => {
  const durationMs = assignment.endTime.getTime() - assignment.startTime.getTime();
  return Math.round(durationMs / (1000 * 60));
};

// Format date to human-readable format
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Format time to human-readable format
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
