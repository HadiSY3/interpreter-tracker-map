export interface Assignment {
  id: string;
  clientName: string;
  location: Location;
  category: Category;
  startTime: Date;
  endTime: Date;
  notes?: string;
  interpreter?: Interpreter; // Optionales Feld für den Dolmetscher
  language?: string; // Neue Eigenschaft für die verwendete Sprache
  paid: boolean; // Neue Eigenschaft, ob der Einsatz bezahlt wurde
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
  travelCost: number; // Neue Eigenschaft für Fahrtkosten
}

// Initial data for locations - with example data
export const initialLocations: Location[] = [
  {
    id: "loc-1",
    name: "Amtsgericht Berlin",
    address: "Littenstraße 12-17, 10179 Berlin",
    coordinates: [13.4133, 52.5138],
    visitCount: 12
  },
  {
    id: "loc-2",
    name: "Polizeipräsidium München",
    address: "Ettstraße 2, 80333 München",
    coordinates: [11.5687, 48.1392],
    visitCount: 8
  },
  {
    id: "loc-3",
    name: "Landgericht Frankfurt",
    address: "Gerichtsstraße 2, 60313 Frankfurt am Main",
    coordinates: [8.6821, 50.1109],
    visitCount: 5
  },
  {
    id: "loc-4",
    name: "Bundesamt für Migration Hamburg",
    address: "Amsinckstraße 28, 20097 Hamburg",
    coordinates: [9.9937, 53.5488],
    visitCount: 7
  }
];

// Initial data for categories - with example data and added travel costs
export const initialCategories: Category[] = [
  {
    id: "cat-1",
    name: "Gericht",
    hourlyRate: 85,
    minuteRate: 1.417,
    travelCost: 0.30 // €/km
  },
  {
    id: "cat-2",
    name: "Polizei",
    hourlyRate: 70,
    minuteRate: 1.167,
    travelCost: 0.25 // €/km
  },
  {
    id: "cat-3",
    name: "Behörde",
    hourlyRate: 65,
    minuteRate: 1.083,
    travelCost: 0.25 // €/km
  },
  {
    id: "cat-4",
    name: "Medizinisch",
    hourlyRate: 90,
    minuteRate: 1.5,
    travelCost: 0.35 // €/km
  }
];

// Initial data for interpreters - with two example interpreters
export const initialInterpreters: Interpreter[] = [
  {
    id: "int-1",
    name: "Thomas Schmidt",
    email: "thomas.schmidt@example.com",
    phone: "+49123456789",
    languages: ["Deutsch", "Englisch", "Französisch"],
    assignmentCount: 4
  },
  {
    id: "int-2",
    name: "Müller, Anna",
    email: "anna.mueller@example.com",
    phone: "+49987654321",
    languages: ["Deutsch", "Spanisch", "Italienisch"],
    assignmentCount: 7
  },
  {
    id: "int-3",
    name: "Hassan Ali",
    email: "hassan.ali@example.com",
    phone: "+49555123456",
    languages: ["Deutsch", "Arabisch", "Englisch"],
    assignmentCount: 5
  },
  {
    id: "int-4",
    name: "Ivanova, Elena",
    email: "elena.ivanova@example.com",
    phone: "+49777888999",
    languages: ["Deutsch", "Russisch", "Ukrainisch"],
    assignmentCount: 3
  }
];

// Create a date helper function that returns a Date object for a specified number of days ago
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Create a date helper function that adds hours to a date
const addHours = (date: Date, hours: number): Date => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

// Initial assignments - with example data
export const initialAssignments: Assignment[] = [
  {
    id: "asn-1",
    clientName: "Strafverfahren 123/22",
    location: initialLocations[0], // Amtsgericht Berlin
    category: initialCategories[0], // Gericht
    startTime: daysAgo(2),
    endTime: addHours(daysAgo(2), 3),
    notes: "Dolmetschen für Angeklagten",
    interpreter: initialInterpreters[0], // Thomas Schmidt
    paid: false
  },
  {
    id: "asn-2",
    clientName: "Zeugenvernehmung Fall 456/22",
    location: initialLocations[1], // Polizeipräsidium München
    category: initialCategories[1], // Polizei
    startTime: daysAgo(5),
    endTime: addHours(daysAgo(5), 2),
    notes: "Übersetzung für Zeuge",
    interpreter: initialInterpreters[1], // Anna Müller
    paid: true
  },
  {
    id: "asn-3",
    clientName: "Asylantrag 789/22",
    location: initialLocations[3], // Bundesamt für Migration Hamburg
    category: initialCategories[2], // Behörde
    startTime: daysAgo(10),
    endTime: addHours(daysAgo(10), 4),
    notes: "Begleitung zum Asylantrag",
    interpreter: initialInterpreters[2], // Hassan Ali
    paid: false
  },
  {
    id: "asn-4",
    clientName: "Arzttermin Dr. Weber",
    location: {
      id: "loc-temp",
      name: "Praxis Dr. Weber",
      address: "Hauptstraße 55, 10559 Berlin",
      coordinates: [13.3414, 52.5323],
      visitCount: 1
    },
    category: initialCategories[3], // Medizinisch
    startTime: daysAgo(3),
    endTime: addHours(daysAgo(3), 1),
    interpreter: initialInterpreters[3], // Elena Ivanova
    paid: false
  },
  {
    id: "asn-5",
    clientName: "Zivilprozess 234/22",
    location: initialLocations[2], // Landgericht Frankfurt
    category: initialCategories[0], // Gericht
    startTime: daysAgo(7),
    endTime: addHours(daysAgo(7), 5),
    interpreter: initialInterpreters[0], // Thomas Schmidt
    paid: false
  },
  {
    id: "asn-6",
    clientName: "Vernehmung 567/22",
    location: initialLocations[1], // Polizeipräsidium München
    category: initialCategories[1], // Polizei
    startTime: daysAgo(8),
    endTime: addHours(daysAgo(8), 3),
    notes: "Verdächtiger im Fall 567/22",
    interpreter: initialInterpreters[1], // Anna Müller
    paid: false
  },
  {
    id: "asn-7",
    clientName: "Einbürgerungsantrag",
    location: initialLocations[3], // Bundesamt für Migration Hamburg
    category: initialCategories[2], // Behörde
    startTime: daysAgo(12),
    endTime: addHours(daysAgo(12), 2),
    interpreter: initialInterpreters[1], // Anna Müller
    paid: false
  },
  {
    id: "asn-8",
    clientName: "Familienrechtssache 789/22",
    location: initialLocations[0], // Amtsgericht Berlin
    category: initialCategories[0], // Gericht
    startTime: daysAgo(15),
    endTime: addHours(daysAgo(15), 4),
    interpreter: initialInterpreters[0], // Thomas Schmidt
    paid: false
  },
  {
    id: "asn-9",
    clientName: "Psychologisches Gutachten",
    location: {
      id: "loc-temp-2",
      name: "Psychologische Praxis Dr. Schneider",
      address: "Friedrichstraße 110, 10117 Berlin",
      coordinates: [13.3878, 52.5250],
      visitCount: 1
    },
    category: initialCategories[3], // Medizinisch
    startTime: daysAgo(9),
    endTime: addHours(daysAgo(9), 2),
    notes: "Gutachten für Gerichtsverfahren",
    interpreter: initialInterpreters[1], // Anna Müller
    paid: false
  },
  {
    id: "asn-10",
    clientName: "Anklageschrift 345/22",
    location: initialLocations[0], // Amtsgericht Berlin
    category: initialCategories[0], // Gericht
    startTime: daysAgo(6),
    endTime: addHours(daysAgo(6), 3),
    interpreter: initialInterpreters[2], // Hassan Ali
    paid: false
  },
  {
    id: "asn-11",
    clientName: "Zeugenaussage 678/22",
    location: initialLocations[1], // Polizeipräsidium München
    category: initialCategories[1], // Polizei
    startTime: daysAgo(11),
    endTime: addHours(daysAgo(11), 2),
    interpreter: initialInterpreters[1], // Anna Müller
    paid: false
  },
  {
    id: "asn-12",
    clientName: "Aufenthaltserlaubnis",
    location: initialLocations[3], // Bundesamt für Migration Hamburg
    category: initialCategories[2], // Behörde
    startTime: daysAgo(14),
    endTime: addHours(daysAgo(14), 3),
    interpreter: initialInterpreters[2], // Hassan Ali
    paid: false
  },
  {
    id: "asn-13",
    clientName: "Orthopädische Untersuchung",
    location: {
      id: "loc-temp-3",
      name: "Orthopädiezentrum",
      address: "Müllerstraße 45, 13353 Berlin",
      coordinates: [13.3662, 52.5425],
      visitCount: 1
    },
    category: initialCategories[3], // Medizinisch
    startTime: daysAgo(4),
    endTime: addHours(daysAgo(4), 1),
    interpreter: initialInterpreters[3], // Elena Ivanova
    paid: false
  },
  {
    id: "asn-14",
    clientName: "Berufungsverfahren 456/21",
    location: initialLocations[2], // Landgericht Frankfurt
    category: initialCategories[0], // Gericht
    startTime: daysAgo(16),
    endTime: addHours(daysAgo(16), 6),
    notes: "Berufung gegen Urteil vom 15.03.2021",
    interpreter: initialInterpreters[0], // Thomas Schmidt
    paid: false
  },
  {
    id: "asn-15",
    clientName: "Beschuldigtenvernehmung 789/22",
    location: initialLocations[1], // Polizeipräsidium München
    category: initialCategories[1], // Polizei
    startTime: daysAgo(13),
    endTime: addHours(daysAgo(13), 4),
    interpreter: initialInterpreters[1], // Anna Müller
    paid: false
  },
  {
    id: "asn-16",
    clientName: "Visumantragsstellung",
    location: initialLocations[3], // Bundesamt für Migration Hamburg
    category: initialCategories[2], // Behörde
    startTime: daysAgo(18),
    endTime: addHours(daysAgo(18), 2),
    interpreter: initialInterpreters[3], // Elena Ivanova
    paid: false
  },
  {
    id: "asn-17",
    clientName: "Neurologische Untersuchung",
    location: {
      id: "loc-temp-4",
      name: "Neurologische Klinik",
      address: "Charitestraße 1, 10117 Berlin",
      coordinates: [13.3777, 52.5281],
      visitCount: 2
    },
    category: initialCategories[3], // Medizinisch
    startTime: daysAgo(7),
    endTime: addHours(daysAgo(7), 2),
    interpreter: initialInterpreters[2], // Hassan Ali
    paid: false
  },
  {
    id: "asn-18",
    clientName: "Gerichtstermin 123/21",
    location: initialLocations[0], // Amtsgericht Berlin
    category: initialCategories[0], // Gericht
    startTime: daysAgo(21),
    endTime: addHours(daysAgo(21), 3),
    interpreter: initialInterpreters[2], // Hassan Ali
    paid: false
  },
  {
    id: "asn-19",
    clientName: "Psychiatrisches Gutachten",
    location: {
      id: "loc-temp-5",
      name: "Psychiatrische Klinik",
      address: "Augustenburger Platz 1, 13353 Berlin",
      coordinates: [13.3493, 52.5429],
      visitCount: 1
    },
    category: initialCategories[3], // Medizinisch
    startTime: daysAgo(5),
    endTime: addHours(daysAgo(5), 3),
    interpreter: initialInterpreters[3], // Elena Ivanova
    paid: false
  }
];

// For all other assignments, set paid to false by default
initialAssignments.forEach(assignment => {
  if (assignment.paid === undefined) {
    assignment.paid = false;
  }
});

// Update

