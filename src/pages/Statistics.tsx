
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from '@/components/ui/charts';
import Layout from '@/components/Layout';
import { calculateDuration, calculateEarnings } from '@/lib/types';
import { useData } from '@/contexts/DataContext';

const Statistics = () => {
  const { assignments, categories, locations } = useData();

  // Early return for empty data
  if (assignments.length === 0) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-up">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statistiken</h1>
            <p className="text-muted-foreground mt-1">
              Übersicht Ihrer Dolmetschereinsätze und Einnahmen.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Keine Daten verfügbar</CardTitle>
              <CardDescription>
                Bitte fügen Sie zuerst Einsätze hinzu, um Statistiken zu sehen.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              Erstellen Sie Einsätze, um Ihre Statistiken hier zu sehen.
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Calculate total earnings
  const totalEarnings = assignments.reduce((sum, assignment) => {
    return sum + calculateEarnings(assignment);
  }, 0);

  // Calculate total minutes
  const totalMinutes = assignments.reduce((sum, assignment) => {
    return sum + calculateDuration(assignment);
  }, 0);

  // Create data for category distribution chart
  const categoryData = categories.map(category => {
    const categoryAssignments = assignments.filter(a => a.category.id === category.id);
    const count = categoryAssignments.length;
    const earnings = categoryAssignments.reduce((sum, a) => sum + calculateEarnings(a), 0);
    
    return {
      name: category.name,
      value: count,
      earnings: earnings,
    };
  }).filter(item => item.value > 0);

  // Create data for locations chart
  const locationData = locations.map(location => {
    const locationAssignments = assignments.filter(a => a.location.id === location.id);
    return {
      name: location.name,
      value: locationAssignments.length,
    };
  }).filter(item => item.value > 0);

  // Format hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedDuration = `${hours}h ${minutes}m`;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiken</h1>
          <p className="text-muted-foreground mt-1">
            Übersicht Ihrer Dolmetschereinsätze und Einnahmen.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gesamteinnahmen
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Für {assignments.length} Einsätze
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gesamtzeit
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formattedDuration}</div>
              <p className="text-xs text-muted-foreground">
                {totalMinutes} Minuten insgesamt
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategorien</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                Verschiedene Einsatzkategorien
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orte</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5 0 4 4 0 0 1-5 0 4 4 0 0 1-5 0" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{locations.length}</div>
              <p className="text-xs text-muted-foreground">
                Verschiedene Einsatzorte
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Einsätze nach Kategorie</CardTitle>
              <CardDescription>
                Verteilung der Einsätze nach Kategorie
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <PieChart 
                data={categoryData} 
                width={400} 
                height={300} 
              />
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Einsätze nach Ort</CardTitle>
              <CardDescription>
                Verteilung der Einsätze nach Ort
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={locationData} 
                width={400} 
                height={300}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;
