
import React, { useState } from 'react';
import { Plus, Calendar, Search, Clock, X, Filter, Download } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AssignmentForm from '@/components/AssignmentForm';
import { Assignment, calculateDuration, formatDate, formatTime } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';

const Assignments = () => {
  const { assignments, setAssignments, categories } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editAssignment, setEditAssignment] = useState<Assignment | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAssignmentSubmit = (assignment: Assignment) => {
    if (editAssignment) {
      // Update existing assignment
      setAssignments(assignments.map(a => 
        a.id === assignment.id ? assignment : a
      ));
      
      toast({
        title: "Einsatz aktualisiert",
        description: `Der Einsatz für ${assignment.clientName} wurde erfolgreich aktualisiert.`
      });
    } else {
      // Add new assignment
      setAssignments([...assignments, assignment]);
      
      toast({
        title: "Einsatz erstellt",
        description: `Ein neuer Einsatz für ${assignment.clientName} wurde erfolgreich erstellt.`
      });
    }
    
    setShowForm(false);
    setEditAssignment(undefined);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditAssignment(undefined);
  };

  const handleEditClick = (assignment: Assignment) => {
    setEditAssignment(assignment);
    setShowForm(true);
  };

  // Get current category rates
  const getCategoryRate = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || null;
  };

  // Calculate earnings using current rates
  const calculateEarnings = (assignment: Assignment): number => {
    const durationMinutes = calculateDuration(assignment);
    const currentCategory = getCategoryRate(assignment.category.id);
    if (currentCategory) {
      return parseFloat((durationMinutes * currentCategory.minuteRate).toFixed(2));
    }
    return parseFloat((durationMinutes * assignment.category.minuteRate).toFixed(2));
  };

  const filteredAssignments = assignments.filter(assignment => 
    assignment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (assignment.interpreter && assignment.interpreter.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    assignment.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      {showForm ? (
        <AssignmentForm 
          initialData={editAssignment} 
          onSubmit={handleAssignmentSubmit}
          onCancel={handleCancelForm}
        />
      ) : (
        <div className="space-y-6 animate-fade-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Einsätze</h1>
              <p className="text-muted-foreground mt-1">
                Verwalten Sie Ihre Dolmetschereinsätze und deren Details.
              </p>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700 shadow"
            >
              <Plus className="mr-2 h-4 w-4" />
              Neuer Einsatz
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 border-purple-200 focus:border-purple-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="icon" className="h-10 w-10 border-purple-200 hover:bg-purple-50 hover:border-purple-300">
                <Filter className="h-5 w-5 text-purple-500" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10 border-purple-200 hover:bg-purple-50 hover:border-purple-300">
                <Download className="h-5 w-5 text-purple-500" />
              </Button>
            </div>
          </div>

          <Card className="border border-purple-100 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <CardTitle>Einsatzübersicht</CardTitle>
              <CardDescription>
                {filteredAssignments.length} Einsätze gefunden
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchTerm ? (
                    <>
                      <p className="mb-2">Keine Ergebnisse für "{searchTerm}" gefunden.</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchTerm('')} 
                        className="mt-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                      >
                        Filter zurücksetzen
                      </Button>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-12 w-12 mx-auto mb-3 text-purple-300" />
                      <p className="mb-1">Keine Einsätze vorhanden</p>
                      <p className="text-sm mb-3">Legen Sie einen neuen Einsatz an, um zu beginnen.</p>
                      <Button 
                        onClick={() => setShowForm(true)} 
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Neuer Einsatz
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-purple-50/50">
                        <TableHead>Klient</TableHead>
                        <TableHead>Datum & Zeit</TableHead>
                        <TableHead>Ort</TableHead>
                        <TableHead>Dolmetscher</TableHead>
                        <TableHead>Dauer</TableHead>
                        <TableHead className="text-right">Vergütung</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.map((assignment) => {
                        const durationMs = assignment.endTime.getTime() - assignment.startTime.getTime();
                        const durationMinutes = Math.floor(durationMs / (1000 * 60));
                        const hours = Math.floor(durationMinutes / 60);
                        const minutes = durationMinutes % 60;
                        const durationText = `${hours > 0 ? `${hours}h ` : ''}${minutes}min`;
                        
                        return (
                          <TableRow key={assignment.id} className="group hover:bg-purple-50/30">
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
                              <div className="flex items-center">
                                <Badge variant="outline" className="bg-indigo-50 text-xs border-indigo-200 text-indigo-600">
                                  {assignment.location.name.split(' ')[0]}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {assignment.interpreter ? (
                                <Badge className="bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200">
                                  {assignment.interpreter.name}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">Nicht zugewiesen</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3 text-purple-400" />
                                <span>{durationText}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              €{calculateEarnings(assignment).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(assignment)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              >
                                Bearbeiten
                              </Button>
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
        </div>
      )}
    </Layout>
  );
};

export default Assignments;
