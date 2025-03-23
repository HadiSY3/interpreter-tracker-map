
import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, Printer, ArrowRight, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useData } from '@/contexts/DataContext';
import { Assignment, calculateDuration } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

interface ReportGeneratorProps {
  className?: string;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ className }) => {
  const { interpreters, assignments, categories } = useData();
  const [selectedInterpreter, setSelectedInterpreter] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportType, setReportType] = useState<"summary" | "detailed" | "invoice">("summary");

  // Get current category rates
  const getCategoryRate = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || null;
  };

  // Filter assignments based on selected interpreter and date range
  const filteredAssignments = React.useMemo(() => {
    let filtered = assignments;
    
    if (selectedInterpreter) {
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

  // Calculate total earnings with current rates
  const totalEarnings = React.useMemo(() => {
    return filteredAssignments.reduce((sum, assignment) => {
      // Get current category
      const currentCategory = getCategoryRate(assignment.category.id);
      if (currentCategory) {
        const durationMinutes = calculateDuration(assignment);
        return sum + (durationMinutes * currentCategory.minuteRate);
      }
      
      // Fallback to stored category if current not found
      const durationMinutes = calculateDuration(assignment);
      return sum + (durationMinutes * assignment.category.minuteRate);
    }, 0);
  }, [filteredAssignments, categories]);

  // Calculate total minutes
  const totalMinutes = React.useMemo(() => {
    return filteredAssignments.reduce(
      (sum, assignment) => sum + calculateDuration(assignment), 
      0
    );
  }, [filteredAssignments]);

  const generateReport = () => {
    if (!selectedInterpreter) {
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

    const interpreter = interpreters.find(i => i.id === selectedInterpreter);
    if (!interpreter) {
      toast({
        title: "Fehler",
        description: "Dolmetscher nicht gefunden",
        variant: "destructive"
      });
      return;
    }

    try {
      if (reportType === "invoice") {
        generateInvoice(interpreter);
      } else if (reportType === "detailed") {
        generateDetailedReport(interpreter);
      } else {
        generateSummaryReport(interpreter);
      }
    } catch (error) {
      console.error("Report generation error:", error);
      toast({
        title: "Fehler",
        description: "Beim Erstellen des Berichts ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  const generateSummaryReport = (interpreter: { id: string; name: string; email: string }) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Einsatzübersicht (Zusammenfassung)', 14, 22);
    
    // Add interpreter info
    doc.setFontSize(12);
    doc.text(`Dolmetscher: ${interpreter.name}`, 14, 32);
    doc.text(`Zeitraum: ${format(startDate!, 'dd.MM.yyyy')} - ${format(endDate!, 'dd.MM.yyyy')}`, 14, 38);
    
    // Add summary
    doc.setFontSize(11);
    doc.text(`Gesamtvergütung: €${totalEarnings.toFixed(2)}`, 14, 48);
    doc.text(`Einsatzstunden: ${(totalMinutes / 60).toFixed(1)}h`, 14, 54);
    doc.text(`Anzahl der Einsätze: ${filteredAssignments.length}`, 14, 60);
    
    // Group by category
    const categoryTotals: Record<string, { count: number; earnings: number; duration: number }> = {};
    
    filteredAssignments.forEach(assignment => {
      const categoryId = assignment.category.id;
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = { count: 0, earnings: 0, duration: 0 };
      }
      
      const durationMinutes = calculateDuration(assignment);
      const currentCategory = getCategoryRate(categoryId);
      const earnings = currentCategory 
        ? durationMinutes * currentCategory.minuteRate 
        : durationMinutes * assignment.category.minuteRate;
        
      categoryTotals[categoryId].count += 1;
      categoryTotals[categoryId].earnings += earnings;
      categoryTotals[categoryId].duration += durationMinutes;
    });
    
    // Create category summary table
    const categoryTableData = Object.entries(categoryTotals).map(([categoryId, data]) => {
      const category = categories.find(c => c.id === categoryId);
      return [
        category?.name || 'Unbekannt',
        data.count.toString(),
        `${(data.duration / 60).toFixed(1)}h`,
        `€${data.earnings.toFixed(2)}`
      ];
    });
    
    autoTable(doc, {
      startY: 70,
      head: [['Kategorie', 'Anzahl', 'Dauer', 'Vergütung']],
      body: categoryTableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    const filename = `zusammenfassung_${interpreter.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(filename);
    
    toast({
      title: "Bericht erstellt",
      description: `Die Zusammenfassung wurde erfolgreich generiert.`
    });
  };

  const generateDetailedReport = (interpreter: { id: string; name: string; email: string }) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Einsatzübersicht (Detailliert)', 14, 22);
    
    // Add interpreter info
    doc.setFontSize(12);
    doc.text(`Dolmetscher: ${interpreter.name}`, 14, 32);
    doc.text(`Zeitraum: ${format(startDate!, 'dd.MM.yyyy')} - ${format(endDate!, 'dd.MM.yyyy')}`, 14, 38);
    
    // Add summary
    doc.setFontSize(11);
    doc.text(`Gesamtvergütung: €${totalEarnings.toFixed(2)}`, 14, 48);
    doc.text(`Einsatzstunden: ${(totalMinutes / 60).toFixed(1)}h`, 14, 54);
    doc.text(`Anzahl der Einsätze: ${filteredAssignments.length}`, 14, 60);
    
    // Add table with assignments
    const tableColumn = ['Datum', 'Klient', 'Ort', 'Kategorie', 'Dauer', 'Vergütung'];
    const tableRows = filteredAssignments
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .map(assignment => {
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
    
    const filename = `detailbericht_${interpreter.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(filename);
    
    toast({
      title: "Bericht erstellt",
      description: `Der detaillierte Bericht wurde erfolgreich generiert.`
    });
  };

  const generateInvoice = (interpreter: { id: string; name: string; email: string }) => {
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
    
    // Add billing period
    doc.text(`Abrechnungszeitraum: ${format(startDate!, 'dd.MM.yyyy')} - ${format(endDate!, 'dd.MM.yyyy')}`, 14, 64);
    
    // Add table with assignments
    const tableColumn = ['Datum', 'Klient', 'Kategorie', 'Stunden', 'Stundensatz', 'Betrag'];
    const tableRows = filteredAssignments
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .map(assignment => {
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
    
    // Add invoice table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Add total amount
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.text(`Gesamtbetrag: €${totalEarnings.toFixed(2)}`, 150, finalY + 20, { align: 'right' });
    
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
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-primary" />
          Berichte und Rechnungen
        </CardTitle>
        <CardDescription>
          Erstellen Sie Berichte und Rechnungen für einen bestimmten Zeitraum.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="interpreter-select">
            Dolmetscher auswählen
          </label>
          <Select 
            value={selectedInterpreter} 
            onValueChange={setSelectedInterpreter}
          >
            <SelectTrigger id="interpreter-select">
              <SelectValue placeholder="Dolmetscher auswählen" />
            </SelectTrigger>
            <SelectContent>
              {interpreters.map(interpreter => (
                <SelectItem key={interpreter.id} value={interpreter.id}>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    {interpreter.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="start-date">
              Startdatum
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input 
                id="start-date"
                type="date" 
                className="w-full pl-10 pr-3 py-2 rounded-md border border-border text-sm"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="end-date">
              Enddatum
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input 
                id="end-date"
                type="date" 
                className="w-full pl-10 pr-3 py-2 rounded-md border border-border text-sm"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">
            Berichtstyp
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={reportType === "summary" ? "default" : "outline"}
              className="justify-start"
              onClick={() => setReportType("summary")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Zusammenfassung
            </Button>
            <Button
              variant={reportType === "detailed" ? "default" : "outline"}
              className="justify-start"
              onClick={() => setReportType("detailed")}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Detailliert
            </Button>
            <Button
              variant={reportType === "invoice" ? "default" : "outline"}
              className="justify-start"
              onClick={() => setReportType("invoice")}
            >
              <Printer className="mr-2 h-4 w-4" />
              Rechnung
            </Button>
          </div>
        </div>

        {selectedInterpreter && startDate && endDate && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Vorschau:</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-3 rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Einsätze</p>
                  <p className="text-lg font-bold">{filteredAssignments.length}</p>
                </div>
                <div className="bg-secondary/50 p-3 rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Dauer</p>
                  <p className="text-lg font-bold">{(totalMinutes / 60).toFixed(1)}h</p>
                </div>
                <div className="bg-secondary/50 p-3 rounded-md text-center">
                  <p className="text-sm text-muted-foreground">Vergütung</p>
                  <p className="text-lg font-bold">€{totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={generateReport}
          disabled={!selectedInterpreter || !startDate || !endDate}
        >
          {reportType === "invoice" ? (
            <>
              <Printer className="mr-2 h-4 w-4" />
              Rechnung erstellen
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Bericht erstellen
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportGenerator;
