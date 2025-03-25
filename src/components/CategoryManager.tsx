
import React, { useState } from 'react';
import { 
  PlusCircle, Edit, Trash2, Tag, DollarSign, 
  Clock, Car, Check, X, AlertCircle
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
import { Category, initialCategories } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

interface CategoryManagerProps {
  categories?: Category[];
  onCategoryAdd?: (category: Category) => void;
  onCategoryUpdate?: (category: Category) => void;
  onCategoryDelete?: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories = initialCategories,
  onCategoryAdd,
  onCategoryUpdate,
  onCategoryDelete,
}) => {
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id'>>({
    name: '',
    hourlyRate: 0,
    minuteRate: 0,
    travelCost: 0
  });
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (!newCategory.name || newCategory.hourlyRate <= 0) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen und einen gültigen Stundensatz ein",
        variant: "destructive"
      });
      return;
    }

    const minuteRate = parseFloat((newCategory.hourlyRate / 60).toFixed(2));
    
    const category: Category = {
      id: crypto.randomUUID(),
      name: newCategory.name,
      hourlyRate: newCategory.hourlyRate,
      minuteRate: minuteRate,
      travelCost: newCategory.travelCost || 0,
    };

    if (onCategoryAdd) {
      onCategoryAdd(category);
    }

    setNewCategory({
      name: '',
      hourlyRate: 0,
      minuteRate: 0,
      travelCost: 0
    });
    
    setIsAddDialogOpen(false);
    
    toast({
      title: "Kategorie erstellt",
      description: `Die Kategorie "${category.name}" wurde erfolgreich erstellt.`
    });
  };

  const handleUpdateCategory = () => {
    if (!editCategory || !editCategory.name || editCategory.hourlyRate <= 0) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen und einen gültigen Stundensatz ein",
        variant: "destructive"
      });
      return;
    }

    const minuteRate = parseFloat((editCategory.hourlyRate / 60).toFixed(2));
    
    const updatedCategory: Category = {
      ...editCategory,
      minuteRate: minuteRate,
    };

    if (onCategoryUpdate) {
      onCategoryUpdate(updatedCategory);
    }

    setEditCategory(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Kategorie aktualisiert",
      description: `Die Kategorie "${updatedCategory.name}" wurde erfolgreich aktualisiert. Die Änderungen wurden in der gesamten Anwendung übernommen.`
    });
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete && onCategoryDelete) {
      onCategoryDelete(categoryToDelete);
      
      const categoryName = categories.find(c => c.id === categoryToDelete)?.name;
      
      toast({
        title: "Kategorie gelöscht",
        description: `Die Kategorie "${categoryName}" wurde erfolgreich gelöscht.`
      });
      
      setCategoryToDelete(null);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditCategory(category);
    setIsEditDialogOpen(true);
  };

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Tag className="mr-2 h-5 w-5 text-primary" />
            Kategorien
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Neue Kategorie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] animate-scale-in">
              <DialogHeader>
                <DialogTitle>Neue Kategorie erstellen</DialogTitle>
                <DialogDescription>
                  Definieren Sie eine neue Kategorie für Ihre Dolmetschereinsätze mit individuellen Vergütungssätzen.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="z.B. Gerichtstermin"
                      className="pl-10"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                    <Tag className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rate">Stundensatz (€)</Label>
                  <div className="relative">
                    <Input
                      id="rate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="z.B. 75.00"
                      className="pl-10"
                      value={newCategory.hourlyRate || ''}
                      onChange={(e) => setNewCategory({ 
                        ...newCategory, 
                        hourlyRate: parseFloat(e.target.value) || 0
                      })}
                    />
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="travelCost">Fahrtkosten (€ pro km)</Label>
                  <div className="relative">
                    <Input
                      id="travelCost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="z.B. 0.30"
                      className="pl-10"
                      value={newCategory.travelCost || ''}
                      onChange={(e) => setNewCategory({ 
                        ...newCategory, 
                        travelCost: parseFloat(e.target.value) || 0
                      })}
                    />
                    <Car className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground border-t border-border/50 pt-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span>Minutensatz:</span>
                    <span className="font-medium">
                      €{newCategory.hourlyRate > 0 
                        ? (newCategory.hourlyRate / 60).toFixed(2) 
                        : '0.00'}/min
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="button" onClick={handleAddCategory}>
                  Erstellen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Erstellen und verwalten Sie Kategorien mit individuellen Vergütungssätzen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <div className="mb-2 flex justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p>Keine Kategorien vorhanden.</p>
            <p className="text-sm">Erstellen Sie eine neue Kategorie, um zu beginnen.</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-white hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{category.name}</p>
                <div className="flex flex-wrap items-center mt-1 text-sm text-muted-foreground gap-2">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>€{category.hourlyRate.toFixed(2)}/h</span>
                  </div>
                  <span className="mx-1">|</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>€{category.minuteRate.toFixed(2)}/min</span>
                  </div>
                  <span className="mx-1">|</span>
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-1" />
                    <span>€{category.travelCost.toFixed(2)}/km</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleEditClick(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                      onClick={() => setCategoryToDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="animate-scale-in">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Kategorie löschen</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sind Sie sicher, dass Sie die Kategorie "{category.name}" löschen möchten?
                        Dies kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
                        Abbrechen
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        onClick={handleDeleteCategory}
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
            <DialogTitle>Kategorie bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisieren Sie die Details und Vergütungssätze dieser Kategorie.
              Die Änderungen werden sofort in allen Statistiken übernommen.
            </DialogDescription>
          </DialogHeader>
          {editCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <div className="relative">
                  <Input
                    id="edit-name"
                    placeholder="Kategoriename"
                    className="pl-10"
                    value={editCategory.name}
                    onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                  />
                  <Tag className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-rate">Stundensatz (€)</Label>
                <div className="relative">
                  <Input
                    id="edit-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-10"
                    value={editCategory.hourlyRate || ''}
                    onChange={(e) => setEditCategory({ 
                      ...editCategory, 
                      hourlyRate: parseFloat(e.target.value) || 0
                    })}
                  />
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-travel-cost">Fahrtkosten (€ pro km)</Label>
                <div className="relative">
                  <Input
                    id="edit-travel-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-10"
                    value={editCategory.travelCost || ''}
                    onChange={(e) => setEditCategory({ 
                      ...editCategory, 
                      travelCost: parseFloat(e.target.value) || 0
                    })}
                  />
                  <Car className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="text-sm text-muted-foreground border-t border-border/50 pt-3 mt-2">
                <div className="flex justify-between items-center">
                  <span>Minutensatz:</span>
                  <span className="font-medium">
                    €{editCategory.hourlyRate > 0 
                      ? (editCategory.hourlyRate / 60).toFixed(2) 
                      : '0.00'}/min
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button type="button" onClick={handleUpdateCategory}>
              Aktualisieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CategoryManager;
