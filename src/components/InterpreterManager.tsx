
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Interpreter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

const InterpreterManager: React.FC = () => {
  const { interpreters, setInterpreters, assignments, setAssignments } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentInterpreter, setCurrentInterpreter] = useState<Interpreter | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [languages, setLanguages] = useState('');

  const handleAddInterpreter = () => {
    if (!name || !email) {
      toast({
        title: "Fehler",
        description: "Name und E-Mail sind erforderlich.",
        variant: "destructive"
      });
      return;
    }

    const newInterpreter: Interpreter = {
      id: uuidv4(),
      name,
      email,
      phone: phone || undefined,
      languages: languages ? languages.split(',').map(lang => lang.trim()) : [],
      assignmentCount: 0
    };

    setInterpreters(prev => [...prev, newInterpreter]);
    resetForm();
    setIsAddDialogOpen(false);
    toast({
      title: "Erfolg",
      description: `Dolmetscher ${name} wurde hinzugefügt.`
    });
  };

  const handleEditInterpreter = () => {
    if (!currentInterpreter || !name || !email) {
      toast({
        title: "Fehler",
        description: "Name und E-Mail sind erforderlich.",
        variant: "destructive"
      });
      return;
    }

    const updatedInterpreter: Interpreter = {
      ...currentInterpreter,
      name,
      email,
      phone: phone || undefined,
      languages: languages ? languages.split(',').map(lang => lang.trim()) : currentInterpreter.languages
    };

    setInterpreters(prev =>
      prev.map(i => i.id === currentInterpreter.id ? updatedInterpreter : i)
    );
    resetForm();
    setIsEditDialogOpen(false);
    toast({
      title: "Erfolg",
      description: `Dolmetscher ${name} wurde aktualisiert.`
    });
  };

  const handleDeleteInterpreter = (id: string, name: string) => {
    // Prüfen, ob dem Dolmetscher Einsätze zugewiesen sind
    const hasAssignments = assignments.some(a => a.interpreter && a.interpreter.id === id);
    
    if (hasAssignments) {
      // Einsätze aktualisieren, um den Dolmetscher zu entfernen
      const updatedAssignments = assignments.map(a => {
        if (a.interpreter && a.interpreter.id === id) {
          return { ...a, interpreter: undefined };
        }
        return a;
      });
      setAssignments(updatedAssignments);
    }
    
    setInterpreters(prev => prev.filter(i => i.id !== id));
    toast({
      title: "Erfolg",
      description: `Dolmetscher ${name} wurde entfernt.`
    });
  };

  const openEditDialog = (interpreter: Interpreter) => {
    setCurrentInterpreter(interpreter);
    setName(interpreter.name);
    setEmail(interpreter.email);
    setPhone(interpreter.phone || '');
    setLanguages(interpreter.languages ? interpreter.languages.join(', ') : '');
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setLanguages('');
    setCurrentInterpreter(null);
  };

  const getAssignmentCount = (interpreterId: string) => {
    return assignments.filter(a => a.interpreter && a.interpreter.id === interpreterId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dolmetscher</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Dolmetscher hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Dolmetscher hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name*</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail*</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@example.com"  
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+49123456789"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="languages">Sprachen (durch Komma getrennt)</Label>
                <Input 
                  id="languages" 
                  value={languages} 
                  onChange={(e) => setLanguages(e.target.value)} 
                  placeholder="Deutsch, Englisch, Französisch"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleAddInterpreter}>Hinzufügen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {interpreters.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">Keine Dolmetscher vorhanden. Fügen Sie Ihren ersten Dolmetscher hinzu.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {interpreters.map((interpreter) => (
            <Card key={interpreter.id}>
              <CardHeader>
                <CardTitle>{interpreter.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Email:</span> {interpreter.email}
                </div>
                {interpreter.phone && (
                  <div className="text-sm">
                    <span className="font-medium">Telefon:</span> {interpreter.phone}
                  </div>
                )}
                {interpreter.languages && interpreter.languages.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Sprachen:</span> {interpreter.languages.join(', ')}
                  </div>
                )}
                <div className="text-sm mt-4">
                  <span className="font-medium">Einsätze:</span> {getAssignmentCount(interpreter.id)}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openEditDialog(interpreter)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDeleteInterpreter(interpreter.id, interpreter.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dolmetscher bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name*</Label>
              <Input 
                id="edit-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">E-Mail*</Label>
              <Input 
                id="edit-email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Telefon</Label>
              <Input 
                id="edit-phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-languages">Sprachen (durch Komma getrennt)</Label>
              <Input 
                id="edit-languages" 
                value={languages} 
                onChange={(e) => setLanguages(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleEditInterpreter}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterpreterManager;
