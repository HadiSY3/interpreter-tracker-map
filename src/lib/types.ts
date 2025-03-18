
export interface Assignment {
  id: string;
  clientName: string;
  location: Location;
  category: Category;
  startTime: Date;
  endTime: Date;
  notes?: string;
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

// Initial data for locations
export const initialLocations: Location[] = [
  {
    id: '1',
    name: 'Jugendamt Hamburg-Mitte',
    address: 'Hamburger Str. 37, 22083 Hamburg',
    coordinates: [10.0157, 53.5711],
    visitCount: 12
  },
  {
    id: '2',
    name: 'Ausländerbehörde',
    address: 'Amsinckstraße 28, 20097 Hamburg',
    coordinates: [10.0212, 53.5461],
    visitCount: 8
  },
  {
    id: '3',
    name: 'Bezirksamt Altona',
    address: 'Platz der Republik 1, 22765 Hamburg',
    coordinates: [9.9365, 53.5461],
    visitCount: 5
  },
  {
    id: '4',
    name: 'Jobcenter Hamburg',
    address: 'Norderreihe 2, 22767 Hamburg',
    coordinates: [9.9502, 53.5509],
    visitCount: 7
  }
];

// Initial data for categories
export const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Standardeinsatz',
    hourlyRate: 70,
    minuteRate: 1.17
  },
  {
    id: '2',
    name: 'Fachberatung',
    hourlyRate: 85,
    minuteRate: 1.42
  },
  {
    id: '3',
    name: 'Gerichtstermin',
    hourlyRate: 95,
    minuteRate: 1.58
  }
];

// Initial assignments
export const initialAssignments: Assignment[] = [
  {
    id: '1',
    clientName: 'Anna Mueller',
    location: initialLocations[0],
    category: initialCategories[0],
    startTime: new Date(2023, 9, 15, 10, 0),
    endTime: new Date(2023, 9, 15, 11, 30),
    notes: 'Erstgespräch zur Familienberatung'
  },
  {
    id: '2',
    clientName: 'Ibrahim Yilmaz',
    location: initialLocations[1],
    category: initialCategories[1],
    startTime: new Date(2023, 9, 16, 14, 0),
    endTime: new Date(2023, 9, 16, 15, 0),
    notes: 'Verlängerung der Aufenthaltsgenehmigung'
  },
  {
    id: '3',
    clientName: 'Maria Rodriguez',
    location: initialLocations[2],
    category: initialCategories[0],
    startTime: new Date(2023, 9, 17, 9, 0),
    endTime: new Date(2023, 9, 17, 10, 15),
    notes: 'Anmeldung neuer Wohnsitz'
  }
];

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
