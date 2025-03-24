import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart } from '@/components/ui/charts';
import { calculateDuration, calculateEarnings, formatDate, formatTime } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DollarSign, Clock, CalendarDays, Users, MapPin, CheckCircle, Check
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

const StatisticsView = () => {
  const { assignments, setAssignments, categories, locations, interpreters } = useData();
  const [selectedInterpreter, setSelectedInterpreter] = React.useState<string>("all");
  const [activeTab, setActiveTab] = React.useState<string>("overview");
  
  // Filter assignments based on selected interpreter
  const filteredAssignments = React.useMemo(() => {
    if (selectedInterpreter === "all") {
      return assignments;
    }
    return assignments.filter(a => 
      a.interpreter && a.interpreter.id === selectedInterpreter
    );
  }, [assignments, selectedInterpreter]);

  // Handler for toggling payment status
  const handlePaymentToggle = (assignmentId: string) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, paid: !assignment.paid } 
        : assignment
    ));
    
    const assignment = assignments.find(a => a.id === assignmentId);
    
    toast({
      title: assignment?.paid ? "Bezahlung zurückgesetzt" : "Als bezahlt markiert",
      description: `Der Einsatz "${assignment?.clientName}" wurde als ${assignment?.paid ? "unbezahlt" : "bezahlt"} markiert.`,
    });
  };

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

  // Get current category rates
  const getCategoryRate = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || null;
  };

  // Calculate total earnings with current rates
  const totalEarnings = filteredAssignments.reduce((sum, assignment) => {
    // Get current category to use current rates
    const currentCategory = getCategoryRate(assignment.category.id);
    if (currentCategory) {
      // Calculate using current category rates
      const durationMinutes = calculateDuration(assignment);
      return sum + (durationMinutes * currentCategory.minuteRate);
    }
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
    
    // Calculate earnings with current rates
    const earnings = categoryAssignments.reduce((sum, a) => {
      const durationMinutes = calculateDuration(a);
      return sum + (durationMinutes * category.minuteRate);
    }, 0);
    
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
    
    // Calculate earnings with current rates
    const earnings = interpreterAssignments.reduce((sum, a) => {
      // Get current category
      const currentCategory = getCategoryRate(a.category.id);
      if (currentCategory) {
        const durationMinutes = calculateDuration(a);
        return sum + (durationMinutes * currentCategory.minuteRate);
      }
      return sum + calculateEarnings(a);
    }, 0);
    
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
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="interpreters">Dolmetscher</TabsTrigger>
            <TabsTrigger value="assignments">Einsätze</TabsTrigger>
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
            <div className="p-2 rounded-full bg-green-500/10 text-green-600">
              <DollarSign className="h-4 w-4" />
            </div>
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
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-600">
              <Clock className="h-4 w-4" />
            </div>
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
            <div className="p-2 rounded-full bg-purple-500/10 text-purple-600">
              <CalendarDays className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryData.length}</div>
            <p className="text-xs text-muted-foreground">
              Verschiedene Einsatzkategorien
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orte</CardTitle>
            <div className="p-2 rounded-full bg-red-500/10 text-red-600">
              <MapPin className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationData.length}</div>
            <p className="text-xs text-muted-foreground">
              Verschiedene Einsatzorte
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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

        <TabsContent value="assignments" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Einsatzübersicht</CardTitle>
              <CardDescription>
                {filteredAssignments.length} Einsätze {selectedInterpreter !== 'all' ? 'für ausgewählten Dolmetscher' : 'insgesamt'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Keine Einsätze gefunden.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-purple-50/50">
                        <TableHead className="w-[250px]">Klient</TableHead>
                        <TableHead>Datum & Zeit</TableHead>
                        <TableHead>Ort</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Dauer</TableHead>
                        <TableHead className="text-right">Vergütung</TableHead>
                        <TableHead className="text-center w-[100px]">Bezahlt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.map((assignment) => {
                        const durationMs = assignment.endTime.getTime() - assignment.startTime.getTime();
                        const durationMinutes = Math.floor(durationMs / (1000 * 60));
                        const hours = Math.floor(durationMinutes / 60);
                        const minutes = durationMinutes % 60;
                        const durationText = `${hours > 0 ? `${hours}h ` : ''}${minutes}min`;
                        
                        // Get current category rate for calculation
                        const currentCategory = getCategoryRate(assignment.category.id);
                        const earnings = currentCategory 
                          ? (durationMinutes * currentCategory.minuteRate) 
                          : calculateEarnings(assignment);
                        
                        return (
                          <TableRow 
                            key={assignment.id} 
                            className={`group hover:bg-purple-50/30 ${assignment.paid ? 'opacity-60 bg-gray-50' : ''}`}
                          >
                            <TableCell className="font-medium">{assignment.clientName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatDate(assignment.startTime)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(assignment.startTime)} - {formatTime(assignment.endTime)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {assignment.location.name}
                            </TableCell>
                            <TableCell>
                              {assignment.category.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3 text-purple-400" />
                                <span>{durationText}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              €{earnings.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center items-center">
                                <Checkbox 
                                  checked={assignment.paid}
                                  onCheckedChange={() => handlePaymentToggle(assignment.id)}
                                  className={`${assignment.paid ? 'bg-green-500 border-green-500' : 'border-purple-300'}`}
                                />
                                {assignment.paid && (
                                  <span className="ml-2 text-xs text-green-600 font-medium flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Bezahlt
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsView;
