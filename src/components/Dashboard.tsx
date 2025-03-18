
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, Clock, CalendarDays, DollarSign, TrendingUp, Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Assignment, calculateEarnings, calculateDuration, Interpreter } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { assignments, locations, interpreters } = useData();
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

  // Calculate total earnings
  const totalEarnings = filteredAssignments.reduce(
    (sum, assignment) => sum + calculateEarnings(assignment), 
    0
  );

  // Calculate total hours worked
  const totalMinutes = filteredAssignments.reduce(
    (sum, assignment) => sum + calculateDuration(assignment), 
    0
  );
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Get most visited location for filtered assignments
  const locationCounts = filteredAssignments.reduce((counts: Record<string, number>, assignment) => {
    const locationId = assignment.location.id;
    counts[locationId] = (counts[locationId] || 0) + 1;
    return counts;
  }, {});

  // Find the location with the most visits
  let mostVisitedLocation = locations[0];
  let maxVisits = 0;
  
  Object.entries(locationCounts).forEach(([locationId, count]) => {
    if (count > maxVisits) {
      maxVisits = count;
      mostVisitedLocation = locations.find(loc => loc.id === locationId) || locations[0];
    }
  });

  const stats = [
    {
      title: 'Gesamtvergütung',
      value: `€${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      title: 'Einsatzstunden',
      value: `${totalHours}h`,
      icon: Clock,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Einsätze',
      value: filteredAssignments.length.toString(),
      icon: CalendarDays,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: 'Beliebtester Ort',
      value: mostVisitedLocation?.name.split(' ')[0] || '-',
      icon: MapPin,
      color: 'bg-red-500/10 text-red-600',
      description: `${maxVisits || 0} Besuche`,
    },
  ];

  return (
    <div className={cn("space-y-6 animate-fade-up", className)}>
      <div className="flex justify-end mb-4">
        <div className="w-full sm:w-[250px]">
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-full", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" />
              Letzte Einsätze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAssignments
                .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
                .slice(0, 3)
                .map((assignment, index) => (
                <div 
                  key={index}
                  className="flex items-center p-3 rounded-lg border border-border/50 bg-white hover:bg-secondary/50 transition-colors"
                >
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{assignment.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {assignment.location.name} • {assignment.startTime.toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">€{calculateEarnings(assignment).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {calculateDuration(assignment)} Min.
                    </p>
                  </div>
                </div>
              ))}
              
              {filteredAssignments.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  Keine Einsätze gefunden.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Orte nach Besuchen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(locationCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([locationId, count], index) => {
                  const location = locations.find(loc => loc.id === locationId);
                  if (!location) return null;
                  
                  const maxCount = Math.max(...Object.values(locationCounts));
                  const percentage = (count / maxCount) * 100;
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm truncate max-w-[70%]">{location.name}</p>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                
              {Object.keys(locationCounts).length === 0 && (
                <div className="py-4 text-center text-muted-foreground">
                  Keine Orte gefunden.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
