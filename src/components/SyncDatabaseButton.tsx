
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

interface SyncDatabaseButtonProps {
  className?: string;
}

const SyncDatabaseButton: React.FC<SyncDatabaseButtonProps> = ({ className }) => {
  const { syncWithDatabase, isLoading } = useData();

  const handleSync = async () => {
    try {
      const success = await syncWithDatabase();
      if (success) {
        toast({
          title: "Synchronisierung erfolgreich",
          description: "Die Daten wurden erfolgreich mit der Datenbank synchronisiert.",
        });
      } else {
        toast({
          title: "Synchronisierungsfehler",
          description: "Verbindung zur Datenbank konnte nicht hergestellt werden. Prüfen Sie XAMPP und die Datenbankeinstellungen.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Synchronisierungsfehler",
        description: `Fehler bei der Synchronisierung: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive"
      });
      console.error("Synchronisierungsfehler:", error);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className={className}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Synchronisiere...' : 'Mit Datenbank synchronisieren'}
    </Button>
  );
};

export default SyncDatabaseButton;
