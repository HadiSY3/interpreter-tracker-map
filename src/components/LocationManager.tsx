
import React, { useState } from 'react';
import { 
  PlusCircle, Edit, Trash2, MapPin, Navigation, 
  Check, X, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Location } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

interface LocationManagerProps {
  onLocationSelect?: (location: Location) => void;
}

const LocationManager: React.FC<LocationManagerProps> = ({
  onLocationSelect,
}) => {
  const { locations, setLocations } = useData();
  
  const [newLocation, setNewLocation] = useState<Omit<Location, 'id' | 'visitCount'>>({
    name: '',
    address: '',
    coordinates: [10.0, 53.55], // Default coordinates for Hamburg
  });
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.address) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen und eine Adresse ein",
        variant: "destructive"
      });
      return;
    }
    
    const location: Location = {
      id: crypto.randomUUID(),
      name: newLocation.name,
      address: newLocation.address,
      coordinates: newLocation.coordinates,
      visitCount: 0,
    };

    setLocations([...locations, location]);
    
    setNewLocation({
      name: '',
      address: '',
      coordinates: [10.0, 53.55],
    });
    
    setIsAddDialogOpen(false);
    
    toast({
      title: "Ort erstellt",
      description: `Der Ort "${location.name}" wurde erfolgreich erstellt.`
    });
  };

  const handleUpdateLocation = () => {
    if (!editLocation || !editLocation.name || !editLocation.address) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen und eine Adresse ein",
        variant: "destructive"
      });
      return;
    }

    setLocations(locations.map(loc => 
      loc.id === editLocation.id ? editLocation : loc
    ));

    setEditLocation(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Ort aktualisiert",
      description: `Der Ort "${editLocation.name}" wurde erfolgreich aktualisiert.`
    });
  };

  const handleDeleteLocation = () => {
    if (locationToDelete) {
      const locationName = locations.find(l => l.id === locationToDelete)?.name;
      
      setLocations(locations.filter(l => l.id !== locationToDelete));
      
      toast({
        title: "Ort gelöscht",
        description: `Der Ort "${locationName}" wurde erfolgreich gelöscht.`
      });
      
      setLocationToDelete(null);
    }
  };

  const handleEditClick = (location: Location) => {
    setEditLocation(location);
    setIsEditDialogOpen(true);
  };

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-primary" />
            Orte
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Neuer Ort
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] animate-scale-in">
              <DialogHeader>
                <DialogTitle>Neuen Ort erstellen</DialogTitle>
                <DialogDescription>
                  Definieren Sie einen neuen Ort für Ihre Dolmetschereinsätze.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="z.B. Jugendamt Hamburg"
                      className="pl-10"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    />
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Adresse</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      placeholder="z.B. Hamburger Straße 123"
                      className="pl-10"
                      value={newLocation.address}
                      onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    />
                    <Navigation className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                {/* Coordinates fields could be added here in the future */}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="button" onClick={handleAddLocation}>
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Erstellen und verwalten Sie Orte für Ihre Einsätze.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {locations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <div className="mb-2 flex justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p>Keine Orte vorhanden.</p>
            <p className="text-sm">Erstellen Sie einen neuen Ort, um zu beginnen.</p>
          </div>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-white hover:bg-secondary/50 transition-colors"
            >
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onLocationSelect && onLocationSelect(location)}
              >
                <p className="font-medium truncate">{location.name}</p>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <Navigation className="h-4 w-4 mr-1" />
                  <span>{location.address}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Besuche: {location.visitCount}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleEditClick(location)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                      onClick={() => setLocationToDelete(location.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="animate-scale-in">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ort löschen</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sind Sie sicher, dass Sie den Ort "{location.name}" löschen möchten?
                        Dies kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setLocationToDelete(null)}>
                        Abbrechen
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        onClick={handleDeleteLocation}
                      >
                        Löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] animate-scale-in">
          <DialogHeader>
            <DialogTitle>Ort bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Details dieses Ortes.
            </DialogDescription>
          </DialogHeader>
          {editLocation && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <div className="relative">
                  <Input
                    id="edit-name"
                    placeholder="Ortsname"
                    className="pl-10"
                    value={editLocation.name}
                    onChange={(e) => setEditLocation({ ...editLocation, name: e.target.value })}
                  />
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <div className="relative">
                  <Input
                    id="edit-address"
                    placeholder="Adresse"
                    className="pl-10"
                    value={editLocation.address}
                    onChange={(e) => setEditLocation({ ...editLocation, address: e.target.value })}
                  />
                  <Navigation className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="text-sm text-muted-foreground border-t border-border/50 pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span>Besuche:</span>
                  <span className="font-medium">{editLocation.visitCount}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button type="button" onClick={handleUpdateLocation}>
              Aktualisieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LocationManager;
