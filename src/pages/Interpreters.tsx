
import React from 'react';
import Layout from '@/components/Layout';
import InterpreterManager from '@/components/InterpreterManager';

const Interpreters = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dolmetscher</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Ihre Dolmetscher und sehen Sie deren Einsatzstatistiken ein.
          </p>
        </div>
        
        <InterpreterManager />
      </div>
    </Layout>
  );
};

export default Interpreters;
