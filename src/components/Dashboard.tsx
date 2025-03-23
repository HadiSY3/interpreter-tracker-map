
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, Clock, CalendarDays, DollarSign, TrendingUp, Users, 
  FileText, Calendar, BarChart, Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Assignment, calculateDuration, Interpreter } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import autoTable from 'jspdf-autotable';

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { assignments, locations, interpreters, categories } = useData();
  const [selectedInterpreter, setSelectedInterpreter] = React.useState<string>("all");
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  
  // Filter assignments based on selected interpreter
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;
    
    if (selectedInterpreter !== "all") {
      filtered = filtered.filter(a => 
        a.interpreter && a.interpreter.id === selectedInterpreter
      );
    }
    
    if (startDate) {
      filtered = filtered.filter(a => a.startTime >= startDate);
    }
    
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => a.startTime <= endOfDay);
    }
    
    return filtered;
  }, [assignments, selectedInterpreter, startDate, endDate]);

  // Get current category rates
  const getCategoryRate = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || null;
  };

  // Calculate total earnings with current rates
  const totalEarnings = useMemo(() => {
    return filteredAssignments.reduce((sum, assignment) => {
      // Use current category rates
      const currentCategory = getCategoryRate(assignment.category.id);
      if (currentCategory) {
        const durationMinutes = calculateDuration(assignment);
        return sum + (durationMinutes * currentCategory.minuteRate);
      }
      // Fallback to assignment's stored category if current not found
      const durationMinutes = calculateDuration(assignment);
      return sum + (durationMinutes * assignment.category.minuteRate);
    }, 0);
  }, [filteredAssignments, categories]);

  // Calculate total hours worked
  const totalMinutes = useMemo(() => {
    return filteredAssignments.reduce(
      (sum, assignment) => sum + calculateDuration(assignment), 
      0
    );
  }, [filteredAssignments]);
  
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Get most visited location for filtered assignments
  const locationCounts = useMemo(() => {
    return filteredAssignments.reduce((counts: Record<string, number>, assignment) => {
      const locationId = assignment.location.id;
      counts[locationId] = (counts[locationId] || 0) + 1;
      return counts;
    }, {});
  }, [filteredAssignments]);

  // Find the location with the most visits
  const { mostVisitedLocation, maxVisits } = useMemo(() => {
    let mostVisitedLocation = locations[0];
    let maxVisits = 0;
    
    Object.entries(locationCounts).forEach(([locationId, count]) => {
      if (count > maxVisits) {
        maxVisits = count;
        mostVisitedLocation = locations.find(loc => loc.id === locationId) || locations[0];
      }
    });
    
    return { mostVisitedLocation, maxVisits };
  }, [locationCounts, locations]);

  // Stats for dashboard cards
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

  // Generate PDF function
  const generatePDF = () => {
    if (!selectedInterpreter || selectedInterpreter === "all") {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Dolmetscher aus",
        variant: "destructive"
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Zeitraum aus",
        variant: "destructive"
      });
      return;
    }

    try {
      const interpreter = interpreters.find(i => i.id === selectedInterpreter);
      
      if (!interpreter) {
        toast({
          title: "Fehler",
          description: "Dolmetscher nicht gefunden",
          variant: "destructive"
        });
        return;
      }

      // Create PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Einsatzübersicht', 14, 22);
      
      // Add interpreter info
      doc.setFontSize(12);
      doc.text(`Dolmetscher: ${interpreter.name}`, 14, 32);
      doc.text(`Zeitraum: ${format(startDate, 'dd.MM.yyyy')} - ${format(endDate, 'dd.MM.yyyy')}`, 14, 38);
      
      // Add summary
      doc.setFontSize(11);
      doc.text(`Gesamtvergütung: €${totalEarnings.toFixed(2)}`, 14, 48);
      doc.text(`Einsatzstunden: ${totalHours}h`, 14, 54);
      doc.text(`Anzahl der Einsätze: ${filteredAssignments.length}`, 14, 60);
      
      // Add table with assignments
      const tableColumn = ['Datum', 'Klient', 'Ort', 'Kategorie', 'Dauer', 'Vergütung'];
      const tableRows = filteredAssignments.map(assignment => {
        const durationMinutes = calculateDuration(assignment);
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        const durationText = `${hours > 0 ? `${hours}h ` : ''}${minutes}min`;
        
        // Calculate earnings with current rates
        const currentCategory = getCategoryRate(assignment.category.id);
        const earnings = currentCategory 
          ? durationMinutes * currentCategory.minuteRate 
          : durationMinutes * assignment.category.minuteRate;
        
        return [
          format(assignment.startTime, 'dd.MM.yyyy'),
          assignment.clientName,
          assignment.location.name,
          assignment.category.name,
          durationText,
          `€${earnings.toFixed(2)}`
        ];
      });
      
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      // Save PDF
      const filename = `einsaetze_${interpreter.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(filename);
      
      toast({
        title: "PDF erstellt",
        description: `Die PDF-Datei wurde erfolgreich generiert.`
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Fehler",
        description: "Beim Erstellen der PDF ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  // Generate invoice function for new feature
  const generateInvoice = () => {
    if (!selectedInterpreter || selectedInterpreter === "all") {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Dolmetscher aus",
        variant: "destructive"
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie einen Zeitraum aus",
        variant: "destructive"
      });
      return;
    }

    try {
      const interpreter = interpreters.find(i => i.id === selectedInterpreter);
      
      if (!interpreter) {
        toast({
          title: "Fehler",
          description: "Dolmetscher nicht gefunden",
          variant: "destructive"
        });
        return;
      }

      // Create PDF document
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.text('Rechnung', 14, 22);
      
      // Add invoice number and date
      const today = new Date();
      const invoiceNumber = `INV-${interpreter.id.substring(0, 4)}-${format(today, 'yyyyMMdd')}`;
      
      doc.setFontSize(12);
      doc.text(`Rechnungsnummer: ${invoiceNumber}`, 14, 32);
      doc.text(`Datum: ${format(today, 'dd.MM.yyyy')}`, 14, 38);
      
      // Add interpreter info
      doc.text(`Dolmetscher: ${interpreter.name}`, 14, 48);
      doc.text(`Email: ${interpreter.email}`, 14, 54);
      if (interpreter.phone) {
        doc.text(`Telefon: ${interpreter.phone}`, 14, 60);
      }
      
      // Add billing period
      doc.text(`Abrechnungszeitraum: ${format(startDate, 'dd.MM.yyyy')} - ${format(endDate, 'dd.MM.yyyy')}`, 14, 70);
      
      // Add table with assignments
      const tableColumn = ['Datum', 'Klient', 'Kategorie', 'Stunden', 'Stundensatz', 'Betrag'];
      const tableRows = filteredAssignments.map(assignment => {
        const durationMinutes = calculateDuration(assignment);
        const hours = durationMinutes / 60;
        
        // Get current category rates
        const currentCategory = getCategoryRate(assignment.category.id);
        const hourlyRate = currentCategory ? currentCategory.hourlyRate : assignment.category.hourlyRate;
        const amount = hours * hourlyRate;
        
        return [
          format(assignment.startTime, 'dd.MM.yyyy'),
          assignment.clientName,
          assignment.category.name,
          hours.toFixed(2),
          `€${hourlyRate.toFixed(2)}`,
          `€${amount.toFixed(2)}`
        ];
      });
      
      // Calculate total amount
      const totalAmount = filteredAssignments.reduce((total, assignment) => {
        const durationMinutes = calculateDuration(assignment);
        const hours = durationMinutes / 60;
        
        // Get current category rates
        const currentCategory = getCategoryRate(assignment.category.id);
        const hourlyRate = currentCategory ? currentCategory.hourlyRate : assignment.category.hourlyRate;
        
        return total + (hours * hourlyRate);
      }, 0);
      
      // Add invoice table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 80,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      // Add total amount
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.text(`Gesamtbetrag: €${totalAmount.toFixed(2)}`, 150, finalY + 20, { align: 'right' });
      
      // Add payment information
      doc.text('Zahlungsinformationen:', 14, finalY + 40);
      doc.text('Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.', 14, finalY + 46);
      
      // Save PDF
      const filename = `rechnung_${interpreter.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(filename);
      
      toast({
        title: "Rechnung erstellt",
        description: `Die Rechnung wurde erfolgreich generiert.`
      });
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast({
        title: "Fehler",
        description: "Beim Erstellen der Rechnung ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn("space-y-6 animate-fade-up", className)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
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
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="text-sm text-muted-foreground">Von:</span>
            </div>
            <input 
              type="date" 
              className="px-3 py-1 rounded-md border border-border text-sm"
              value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="text-sm text-muted-foreground">Bis:</span>
            </div>
            <input 
              type="date" 
              className="px-3 py-1 rounded-md border border-border text-sm"
              value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={generatePDF}
              title="Einsatzübersicht als PDF erstellen"
            >
              <FileText className="mr-2 h-4 w-4" /> Bericht
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={generateInvoice}
              title="Rechnung für Dolmetscher erstellen"
            >
              <Printer className="mr-2 h-4 w-4" /> Rechnung
            </Button>
          </div>
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
                .map((assignment, index) => {
                  // Calculate earnings with current rates
                  const durationMinutes = calculateDuration(assignment);
                  const currentCategory = getCategoryRate(assignment.category.id);
                  const earnings = currentCategory 
                    ? durationMinutes * currentCategory.minuteRate 
                    : durationMinutes * assignment.category.minuteRate;
                
                  return (
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
                        <p className="text-sm font-medium">€{earnings.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {durationMinutes} Min.
                        </p>
                      </div>
                    </div>
                  );
                })}
              
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

      {/* New Section: Monthly Overview */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="mr-2 h-5 w-5 text-primary" />
            Monatliche Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Earnings Card */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Einnahmen diesen Monat</h3>
              <div className="text-3xl font-bold">
                €{filteredAssignments
                  .filter(a => {
                    const now = new Date();
                    return a.startTime.getMonth() === now.getMonth() && 
                           a.startTime.getFullYear() === now.getFullYear();
                  })
                  .reduce((sum, a) => {
                    const durationMinutes = calculateDuration(a);
                    const currentCategory = getCategoryRate(a.category.id);
                    return sum + (durationMinutes * (currentCategory?.minuteRate || a.category.minuteRate));
                  }, 0)
                  .toFixed(2)}
              </div>
            </div>

            {/* Monthly Hours Card */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Stunden diesen Monat</h3>
              <div className="text-3xl font-bold">
                {(filteredAssignments
                  .filter(a => {
                    const now = new Date();
                    return a.startTime.getMonth() === now.getMonth() && 
                          a.startTime.getFullYear() === now.getFullYear();
                  })
                  .reduce((sum, a) => sum + calculateDuration(a), 0) / 60)
                  .toFixed(1)}h
              </div>
            </div>

            {/* Monthly Assignments Card */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Einsätze diesen Monat</h3>
              <div className="text-3xl font-bold">
                {filteredAssignments
                  .filter(a => {
                    const now = new Date();
                    return a.startTime.getMonth() === now.getMonth() && 
                          a.startTime.getFullYear() === now.getFullYear();
                  })
                  .length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
