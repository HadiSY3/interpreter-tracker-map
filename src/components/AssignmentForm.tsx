
import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Users, MapPin, FileText, Tag, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Assignment, Category, Location } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const formSchema = z.object({
  clientName: z.string().min(2, { message: 'Bitte geben Sie einen Klientennamen ein' }),
  location: z.string({ required_error: 'Bitte wählen Sie einen Ort aus' }),
  category: z.string({ required_error: 'Bitte wählen Sie eine Kategorie aus' }),
  interpreter: z.string({ required_error: 'Bitte wählen Sie einen Dolmetscher aus' }),
  language: z.string().optional(),
  date: z.date({ required_error: 'Bitte wählen Sie ein Datum aus' }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Bitte geben Sie eine gültige Zeit ein (HH:MM)' }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Bitte geben Sie eine gültige Zeit ein (HH:MM)' }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AssignmentFormProps {
  initialData?: Assignment;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ 
  initialData, 
  onSubmit,
  onCancel
}) => {
  const { categories, locations, interpreters } = useData();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      clientName: initialData.clientName,
      location: initialData.location.id,
      category: initialData.category.id,
      interpreter: initialData.interpreter?.id || '',
      language: initialData.language || '',
      date: initialData.startTime,
      startTime: format(initialData.startTime, 'HH:mm'),
      endTime: format(initialData.endTime, 'HH:mm'),
      notes: initialData.notes || '',
    } : {
      clientName: '',
      location: '',
      category: '',
      interpreter: '',
      language: '',
      startTime: '',
      endTime: '',
      notes: '',
    },
  });

  // Get selected interpreter's languages
  const selectedInterpreter = interpreters.find(i => i.id === form.watch('interpreter'));
  const languages = selectedInterpreter?.languages || [];

  const handleSubmit = (values: FormValues) => {
    // Convert form values to Assignment object
    const selectedLocation = locations.find(loc => loc.id === values.location);
    const selectedCategory = categories.find(cat => cat.id === values.category);
    const selectedInterpreter = interpreters.find(int => int.id === values.interpreter);
    
    if (!selectedLocation || !selectedCategory) {
      toast({
        title: "Fehler",
        description: "Ort oder Kategorie konnte nicht gefunden werden",
        variant: "destructive"
      });
      return;
    }

    // Parse times
    const [startHours, startMinutes] = values.startTime.split(':').map(Number);
    const [endHours, endMinutes] = values.endTime.split(':').map(Number);
    
    const startTime = new Date(values.date);
    startTime.setHours(startHours, startMinutes, 0);
    
    const endTime = new Date(values.date);
    endTime.setHours(endHours, endMinutes, 0);
    
    // Check if end time is after start time
    if (endTime <= startTime) {
      toast({
        title: "Ungültige Zeitangabe",
        description: "Die Endzeit muss nach der Startzeit liegen",
        variant: "destructive"
      });
      return;
    }

    const assignmentData: Assignment = {
      id: initialData?.id || crypto.randomUUID(),
      clientName: values.clientName,
      location: selectedLocation,
      category: selectedCategory,
      startTime: startTime,
      endTime: endTime,
      notes: values.notes,
      interpreter: selectedInterpreter,
      language: values.language,
      paid: initialData?.paid || false // Add the paid property with default value false
    };

    onSubmit(assignmentData);
  };

  return (
    <Card className="border border-border/50 shadow-sm w-full max-w-2xl mx-auto animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl">
          {initialData ? 'Einsatz bearbeiten' : 'Neuen Einsatz anlegen'}
        </CardTitle>
        <CardDescription>
          Erfassen Sie alle Details zum Dolmetschereinsatz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Klient Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Name des Klienten" 
                        {...field} 
                        className="pl-10"
                      />
                      <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interpreter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dolmetscher</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <div className="relative">
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Dolmetscher auswählen" />
                          </SelectTrigger>
                          <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <SelectContent>
                        {interpreters.map((interpreter) => (
                          <SelectItem key={interpreter.id} value={interpreter.id}>
                            {interpreter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {languages.length > 0 && (
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprache</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="relative">
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Sprache auswählen" />
                            </SelectTrigger>
                            <Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <SelectContent>
                          {languages.map((language, index) => (
                            <SelectItem key={index} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <div className="relative">
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Ort auswählen" />
                          </SelectTrigger>
                          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <div className="relative">
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Kategorie auswählen" />
                          </SelectTrigger>
                          <Tag className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} (€{category.hourlyRate}/h)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Datum</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-10 text-left font-normal relative",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: de })
                          ) : (
                            <span>Datum auswählen</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={de}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startzeit</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="HH:MM" 
                          {...field} 
                          className="pl-10"
                        />
                        <Clock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>Format: HH:MM (z.B. 09:30)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endzeit</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="HH:MM" 
                          {...field} 
                          className="pl-10"
                        />
                        <Clock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>Format: HH:MM (z.B. 11:15)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notizen</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea 
                        placeholder="Optionale Notizen zum Einsatz" 
                        className="min-h-[120px] resize-none pl-10 pt-8"
                        {...field} 
                      />
                      <FileText className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-4 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
              >
                {initialData ? 'Aktualisieren' : 'Speichern'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AssignmentForm;
