
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, AlertTriangle, Database } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';
import { testApiConnection } from '@/lib/database';

interface SyncDatabaseButtonProps {
  className?: string;
}

const SyncDatabaseButton: React.FC<SyncDatabaseButtonProps> = ({ className }) => {
  const { syncWithDatabase, isLoading } = useData();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleSync = async () => {
    try {
      // First test connection to API
      setIsTestingConnection(true);
      console.log("Testing API connection...");
      const connected = await testApiConnection();
      setIsTestingConnection(false);
      
      if (!connected) {
        console.error("API connection test failed");
        toast({
          title: "Verbindung fehlgeschlagen",
          description: "Verbindung zur API konnte nicht hergestellt werden. Überprüfen Sie XAMPP und die API-Pfade in database.ts sowie die Datenbank-Konfiguration.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("API connection successful, starting sync...");
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
      setIsTestingConnection(false);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error("Synchronisierungsfehler:", error);
      
      toast({
        title: "Synchronisierungsfehler",
        description: `Fehler bei der Synchronisierung: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading || isTestingConnection}
      variant="outline"
      size="sm"
      className={className}
    >
      {isTestingConnection ? (
        <>
          <Server className="h-4 w-4 mr-2 text-orange-500" />
          Teste Verbindung...
        </>
      ) : isLoading ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Synchronisiere...
        </>
      ) : (
        <>
          <Database className="h-4 w-4 mr-2" />
          Mit Datenbank synchronisieren
        </>
      )}
    </Button>
  );
};

export default SyncDatabaseButton;
