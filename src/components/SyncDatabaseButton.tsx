
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface SyncDatabaseButtonProps {
  className?: string;
}

const SyncDatabaseButton: React.FC<SyncDatabaseButtonProps> = ({ className }) => {
  const { syncWithDatabase, isLoading } = useData();

  return (
    <Button
      onClick={() => syncWithDatabase()}
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
