
import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, Printer, ArrowRight, Users, CalendarRange } from 'lucide-react';
import { format, endOfDay } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useData } from '@/contexts/DataContext';
import { Assignment, calculateDuration } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
      // Make end date inclusive by setting it to end of day
      const endOfDayDate = endOfDay(endDate);
      filtered = filtered.filter(a => a.startTime <= endOfDayDate);
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

    if (!startDate) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Startdatum aus",
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
    
    // Format date range text
    const dateRangeText = endDate 
      ? `Zeitraum: ${format(startDate!, 'dd.MM.yyyy')} - ${format(endDate, 'dd.MM.yyyy')}`
      : `Zeitraum: Ab ${format(startDate!, 'dd.MM.yyyy')} bis heute`;
    
    doc.text(dateRangeText, 14, 38);
    
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
      headStyles: { fillColor: [139, 92, 246] } // Updated color to match the app theme
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
    
    // Format date range text
    const dateRangeText = endDate 
      ? `Zeitraum: ${format(startDate!, 'dd.MM.yyyy')} - ${format(endDate, 'dd.MM.yyyy')}`
      : `Zeitraum: Ab ${format(startDate!, 'dd.MM.yyyy')} bis heute`;
    
    doc.text(dateRangeText, 14, 38);
    
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
      headStyles: { fillColor: [139, 92, 246] } // Updated color to match the app theme
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
    
    // Format date range text
    const dateRangeText = endDate 
      ? `Abrechnungszeitraum: ${format(startDate!, 'dd.MM.yyyy')} - ${format(endDate, 'dd.MM.yyyy')}`
      : `Abrechnungszeitraum: Ab ${format(startDate!, 'dd.MM.yyyy')} bis heute`;
    
    doc.text(dateRangeText, 14, 64);
    
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
      headStyles: { fillColor: [139, 92, 246] } // Updated color to match the app theme
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
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b border-purple-100">
        <CardTitle className="flex items-center text-indigo-800">
          <FileText className="mr-2 h-5 w-5 text-purple-600" />
          Berichte und Rechnungen
        </CardTitle>
        <CardDescription>
          Erstellen Sie Berichte und Rechnungen für einen bestimmten Zeitraum.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5 pt-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="interpreter-select">
            Dolmetscher auswählen
          </label>
          <Select 
            value={selectedInterpreter} 
            onValueChange={setSelectedInterpreter}
          >
            <SelectTrigger id="interpreter-select" className="bg-white border-purple-200 hover:border-purple-300">
              <SelectValue placeholder="Dolmetscher auswählen" />
            </SelectTrigger>
            <SelectContent>
              {interpreters.map(interpreter => (
                <SelectItem key={interpreter.id} value={interpreter.id}>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-purple-500" />
                    {interpreter.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="start-date">
              Startdatum
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
              <input 
                id="start-date"
                type="date" 
                className="w-full pl-10 pr-3 py-2 rounded-md border border-purple-200 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-700" htmlFor="end-date">
                Enddatum
              </label>
              <span className="text-xs text-slate-500">(optional)</span>
            </div>
            <div className="relative">
              <CalendarRange className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
              <input 
                id="end-date"
                type="date" 
                className="w-full pl-10 pr-3 py-2 rounded-md border border-purple-200 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                placeholder="Bis heute"
              />
            </div>
            {!endDate && (
              <div className="text-xs text-slate-500 ml-1 mt-1">
                Ohne Enddatum werden alle Einsätze bis heute berücksichtigt
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Berichtstyp
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={reportType === "summary" ? "default" : "outline"}
              className={reportType === "summary" 
                ? "justify-start bg-purple-600 hover:bg-purple-700" 
                : "justify-start border-purple-200 hover:border-purple-300 text-slate-700"}
              onClick={() => setReportType("summary")}
            >
              <FileText className={`mr-2 h-4 w-4 ${reportType === "summary" ? "text-white" : "text-purple-500"}`} />
              Zusammenfassung
            </Button>
            <Button
              variant={reportType === "detailed" ? "default" : "outline"}
              className={reportType === "detailed" 
                ? "justify-start bg-purple-600 hover:bg-purple-700" 
                : "justify-start border-purple-200 hover:border-purple-300 text-slate-700"}
              onClick={() => setReportType("detailed")}
            >
              <ArrowRight className={`mr-2 h-4 w-4 ${reportType === "detailed" ? "text-white" : "text-purple-500"}`} />
              Detailliert
            </Button>
            <Button
              variant={reportType === "invoice" ? "default" : "outline"}
              className={reportType === "invoice" 
                ? "justify-start bg-purple-600 hover:bg-purple-700" 
                : "justify-start border-purple-200 hover:border-purple-300 text-slate-700"}
              onClick={() => setReportType("invoice")}
            >
              <Printer className={`mr-2 h-4 w-4 ${reportType === "invoice" ? "text-white" : "text-purple-500"}`} />
              Rechnung
            </Button>
          </div>
        </div>

        {selectedInterpreter && startDate && (
          <>
            <Separator className="bg-purple-100" />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700">Vorschau:</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-b from-purple-50 to-indigo-50 p-3 rounded-md text-center border border-purple-100">
                  <p className="text-sm text-indigo-600 font-medium">Einsätze</p>
                  <p className="text-xl font-bold text-indigo-800">{filteredAssignments.length}</p>
                </div>
                <div className="bg-gradient-to-b from-indigo-50 to-purple-50 p-3 rounded-md text-center border border-indigo-100">
                  <p className="text-sm text-indigo-600 font-medium">Dauer</p>
                  <p className="text-xl font-bold text-indigo-800">{(totalMinutes / 60).toFixed(1)}h</p>
                </div>
                <div className="bg-gradient-to-b from-purple-50 to-indigo-50 p-3 rounded-md text-center border border-purple-100">
                  <p className="text-sm text-indigo-600 font-medium">Vergütung</p>
                  <p className="text-xl font-bold text-indigo-800">€{totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-b-lg border-t border-purple-100">
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700" 
          onClick={generateReport}
          disabled={!selectedInterpreter || !startDate}
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
