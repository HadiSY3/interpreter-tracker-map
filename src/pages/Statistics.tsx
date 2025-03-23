
import React from 'react';
import Layout from '@/components/Layout';
import StatisticsView from '@/components/StatisticsView';
import ReportGenerator from '@/components/ReportGenerator';

const Statistics = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiken</h1>
          <p className="text-muted-foreground mt-1">
            Übersicht Ihrer Dolmetschereinsätze und Einnahmen.
          </p>
        </div>
        
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <StatisticsView />
          </div>
          <div className="md:col-span-1">
            <ReportGenerator />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;
