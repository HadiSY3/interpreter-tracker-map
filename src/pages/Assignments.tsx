import React, { useState } from 'react';
import { Plus, Calendar, Search, Clock, MapPin, X, Filter, Download } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssignmentForm from '@/components/AssignmentForm';
import LocationMap from '@/components/LocationMap';
import { Assignment, calculateEarnings, formatDate, formatTime } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';

const Assignments = () => {
  const { assignments, setAssignments, locations } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editAssignment, setEditAssignment] = useState<Assignment | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');

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

  const filteredAssignments = assignments.filter(assignment => 
    assignment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              className="bg-primary hover:bg-primary/90 shadow"
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
                className="pl-10 pr-10"
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
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="list">
                <Calendar className="mr-2 h-4 w-4" />
                Liste
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapPin className="mr-2 h-4 w-4" />
                Karte
              </TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-3">
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
                            className="mt-2"
                          >
                            Filter zurücksetzen
                          </Button>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="mb-1">Keine Einsätze vorhanden</p>
                          <p className="text-sm mb-3">Legen Sie einen neuen Einsatz an, um zu beginnen.</p>
                          <Button 
                            onClick={() => setShowForm(true)} 
                            className="bg-primary hover:bg-primary/90"
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
                          <TableRow>
                            <TableHead>Klient</TableHead>
                            <TableHead>Datum & Zeit</TableHead>
                            <TableHead>Ort</TableHead>
                            <TableHead>Kategorie</TableHead>
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
                              <TableRow key={assignment.id} className="group">
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
                                    <Badge variant="outline" className="bg-secondary/50 text-xs">
                                      {assignment.location.name.split(' ')[0]}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                    {assignment.category.name}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
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
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
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
            </TabsContent>
            
            <TabsContent value="map" className="mt-4">
              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle>Einsatzorte</CardTitle>
                  <CardDescription>
                    Übersicht aller Einsatzorte auf der Karte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LocationMap 
                    locations={locations}
                    onLocationSelect={(location) => {
                      toast({
                        title: location.name,
                        description: `${location.address} - ${location.visitCount} Besuche`
                      });
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Layout>
  );
};

export default Assignments;
