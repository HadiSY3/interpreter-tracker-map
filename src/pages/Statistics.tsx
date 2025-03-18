
import React from 'react';
import Layout from '@/components/Layout';
import StatisticsView from '@/components/StatisticsView';

const Statistics = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiken</h1>
          <p className="text-muted-foreground mt-1">
            Übersicht Ihrer Dolmetschereinsätze und Einnahmen.
          </p>
        </div>
        
        <StatisticsView />
      </div>
    </Layout>
  );
};

export default Statistics;
