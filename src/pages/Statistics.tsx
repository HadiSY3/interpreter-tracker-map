
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { Assignment, Category, Location, calculateEarnings, initialAssignments, initialCategories, initialLocations } from '@/lib/types';
import { BarChart, PieChart } from '@/components/ui/charts';
import { 
  TrendingUp, BarChart3, PieChart as PieChartIcon, Clock, CalendarClock, 
  DollarSign, Building, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Statistics = () => {
  // Calculate statistics
  const totalEarnings = initialAssignments.length > 0 
    ? initialAssignments.reduce((sum, assignment) => sum + calculateEarnings(assignment), 0).toFixed(2)
    : "0.00";

  const assignmentsByLocation = initialLocations.map(location => {
    const count = initialAssignments.filter(
      a => a.location.id === location.id
    ).length;
    
    return {
      name: location.name,
      count,
      value: count,
      color: `hsl(${(parseInt(location.id) * 60) % 360}, 70%, 60%)`,
    };
  }).sort((a, b) => b.count - a.count);

  const earningsByCategory = initialCategories.map(category => {
    const assignments = initialAssignments.filter(a => a.category.id === category.id);
    const earnings = assignments.reduce((sum, a) => sum + calculateEarnings(a), 0);
    
    return {
      name: category.name,
      value: earnings,
      color: `hsl(${(parseInt(category.id) * 70) % 360}, 70%, 60%)`,
    };
  }).sort((a, b) => b.value - a.value);

  // Default monthly data with zeros
  const monthlyData = [
    { name: 'Jan', hours: 0 },
    { name: 'Feb', hours: 0 },
    { name: 'Mär', hours: 0 },
    { name: 'Apr', hours: 0 },
    { name: 'Mai', hours: 0 },
    { name: 'Jun', hours: 0 },
    { name: 'Jul', hours: 0 },
    { name: 'Aug', hours: 0 },
    { name: 'Sep', hours: 0 },
    { name: 'Okt', hours: 0 },
    { name: 'Nov', hours: 0 },
    { name: 'Dez', hours: 0 },
  ];

  // If we have assignments, calculate hours per month
  if (initialAssignments.length > 0) {
    initialAssignments.forEach(assignment => {
      const month = assignment.startTime.getMonth();
      const durationHours = (assignment.endTime.getTime() - assignment.startTime.getTime()) / (1000 * 60 * 60);
      monthlyData[month].hours += durationHours;
    });
  }

  const earningsChartData = earningsByCategory.length > 0 
    ? earningsByCategory.map(item => ({
        name: item.name,
        Umsatz: item.value,
      }))
    : [{ name: 'Keine Daten', Umsatz: 0 }];

  const hoursChartData = monthlyData.map(item => ({
    name: item.name,
    Stunden: item.hours,
  }));

  const barColors = ['hsl(210, 100%, 50%)'];
  const pieColors = earningsByCategory.length > 0 
    ? earningsByCategory.map(item => item.color)
    : ['#cccccc'];

  const noDataMessage = (
    <div className="text-center py-6 text-muted-foreground">
      <p>Noch keine Daten vorhanden. Fügen Sie Einsätze und Kategorien hinzu, um Statistiken zu sehen.</p>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiken</h1>
          <p className="text-muted-foreground mt-1">
            Analysieren Sie Ihre Einsätze und Vergütungen über verschiedene Zeiträume.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard
            title="Gesamtvergütung"
            value={`€${totalEarnings}`}
            description="Alle Einsätze"
            icon={DollarSign}
            color="bg-green-500/10 text-green-600"
          />
          <StatsCard
            title="Einsatzstunden"
            value={initialAssignments.length > 0 
              ? `${monthlyData.reduce((sum, month) => sum + month.hours, 0).toFixed(1)}h` 
              : "0h"}
            description="Insgesamt"
            icon={Clock}
            color="bg-blue-500/10 text-blue-600"
          />
          <StatsCard
            title="Anzahl Einsätze"
            value={`${initialAssignments.length}`}
            description="Insgesamt"
            icon={CalendarClock}
            color="bg-purple-500/10 text-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Stunden pro Monat
                </CardTitle>
                <CardDescription>
                  Verteilung der Arbeitsstunden
                </CardDescription>
              </div>
              {initialAssignments.length > 0 && <TrendingUp className="h-5 w-5 text-green-500" />}
            </CardHeader>
            <CardContent className="pt-4">
              {initialAssignments.length > 0 ? (
                <div className="h-[300px]">
                  <BarChart 
                    data={hoursChartData}
                    index="name"
                    categories={["Stunden"]}
                    colors={barColors}
                    valueFormatter={(value) => `${value.toFixed(1)}h`}
                    showLegend={false}
                    showXAxis={true}
                    showYAxis={true}
                    showGridLines={true}
                  />
                </div>
              ) : noDataMessage}
            </CardContent>
          </Card>

          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center">
                  <PieChartIcon className="mr-2 h-5 w-5 text-primary" />
                  Umsatz nach Kategorie
                </CardTitle>
                <CardDescription>
                  Verteilung der Vergütung
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {initialCategories.length > 0 && initialAssignments.length > 0 ? (
                <div className="h-[300px]">
                  <PieChart 
                    data={earningsChartData}
                    index="name"
                    categories={["Umsatz"]}
                    colors={pieColors}
                    valueFormatter={(value) => `€${value.toFixed(2)}`}
                    showAnimation={true}
                  />
                </div>
              ) : noDataMessage}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building className="mr-2 h-5 w-5 text-primary" />
                Top Einsatzorte
              </CardTitle>
              <CardDescription>
                Häufigkeit der Besuche pro Ort
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentsByLocation.length > 0 ? (
                <div className="space-y-6">
                  {assignmentsByLocation.slice(0, 5).map((location, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate max-w-[70%]">
                          {location.name}
                        </span>
                        <span className="text-sm">{location.count} Einsätze</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="rounded-full h-2"
                          style={{ 
                            width: `${(location.count / Math.max(1, assignmentsByLocation[0].count)) * 100}%`,
                            backgroundColor: location.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : noDataMessage}
            </CardContent>
          </Card>

          <Card className="border border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Tag className="mr-2 h-5 w-5 text-primary" />
                Einnahmen nach Kategorie
              </CardTitle>
              <CardDescription>
                Umsatzverteilung pro Einsatztyp
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earningsByCategory.length > 0 ? (
                <div className="space-y-6">
                  {earningsByCategory.map((category, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate max-w-[70%]">
                          {category.name}
                        </span>
                        <span className="text-sm">€{category.value.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="rounded-full h-2"
                          style={{ 
                            width: `${(category.value / Math.max(0.01, earningsByCategory[0].value)) * 100}%`,
                            backgroundColor: category.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : noDataMessage}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  color 
}) => {
  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-full", color)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Statistics;
