
import React from 'react';
import Layout from '@/components/Layout';
import LocationManager from '@/components/LocationManager';
import { toast } from '@/components/ui/use-toast';

const Locations = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orte</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie die verschiedenen Einsatzorte.
          </p>
        </div>

        <LocationManager 
          onLocationSelect={(location) => {
            toast({
              title: location.name,
              description: `${location.address}`
            });
          }}
        />
      </div>
    </Layout>
  );
};

export default Locations;
