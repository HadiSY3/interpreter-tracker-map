
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from '@/components/ui/charts';
import { calculateDuration, calculateEarnings, Interpreter, Assignment } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StatisticsView = () => {
  const { assignments, categories, locations, interpreters } = useData();
  const [selectedInterpreter, setSelectedInterpreter] = React.useState<string>("all");
  
  // Filter assignments based on selected interpreter
  const filteredAssignments = React.useMemo(() => {
    if (selectedInterpreter === "all") {
      return assignments;
    }
    return assignments.filter(a => 
      a.interpreter && a.interpreter.id === selectedInterpreter
    );
  }, [assignments, selectedInterpreter]);

  // Early return for empty data
  if (assignments.length === 0) {
    return (
      <div className="space-y-6 animate-fade-up">
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
    );
  }

  // Calculate total earnings
  const totalEarnings = filteredAssignments.reduce((sum, assignment) => {
    return sum + calculateEarnings(assignment);
  }, 0);

  // Calculate total minutes
  const totalMinutes = filteredAssignments.reduce((sum, assignment) => {
    return sum + calculateDuration(assignment);
  }, 0);

  // Create data for category distribution chart
  const categoryData = categories.map(category => {
    const categoryAssignments = filteredAssignments.filter(a => a.category.id === category.id);
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
    const locationAssignments = filteredAssignments.filter(a => a.location.id === location.id);
    return {
      name: location.name,
      value: locationAssignments.length,
    };
  }).filter(item => item.value > 0);

  // Create data for interpreter chart
  const interpreterData = interpreters.map(interpreter => {
    const interpreterAssignments = assignments.filter(
      a => a.interpreter && a.interpreter.id === interpreter.id
    );
    const count = interpreterAssignments.length;
    const earnings = interpreterAssignments.reduce(
      (sum, a) => sum + calculateEarnings(a), 0
    );
    
    return {
      name: interpreter.name,
      value: count,
      earnings: earnings,
    };
  }).filter(item => item.value > 0);

  // Format hours and minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedDuration = `${hours}h ${minutes}m`;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <Tabs defaultValue="overview" className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="interpreters">Dolmetscher</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="w-full md:w-[250px]">
          <Select 
            value={selectedInterpreter} 
            onValueChange={setSelectedInterpreter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alle Dolmetscher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Dolmetscher</SelectItem>
              {interpreters.map(interpreter => (
                <SelectItem key={interpreter.id} value={interpreter.id}>
                  {interpreter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              Für {filteredAssignments.length} Einsätze
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 1 0 7.75M16 3.13a4 4 0 0 1 0 7.75" />
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
      
      <Tabs defaultValue="overview">
        <TabsContent value="overview" className="mt-0">
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
                  index="name"
                  categories={["value"]}
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
                  index="name"
                  categories={["value"]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="interpreters" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Einsätze nach Dolmetscher</CardTitle>
              <CardDescription>
                Verteilung der Einsätze nach Dolmetscher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={interpreterData} 
                index="name"
                categories={["value"]}
              />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 mt-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top-Einsatzzahlen</CardTitle>
                <CardDescription>
                  Dolmetscher nach Anzahl der Einsätze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={interpreterData.sort((a, b) => b.value - a.value).slice(0, 5)} 
                  index="name"
                  categories={["value"]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top-Einnahmen</CardTitle>
                <CardDescription>
                  Dolmetscher nach Einnahmen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={interpreterData.sort((a, b) => b.earnings - a.earnings).slice(0, 5)} 
                  index="name"
                  categories={["earnings"]}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsView;
