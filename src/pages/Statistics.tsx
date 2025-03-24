
import React from 'react';
import Layout from '@/components/Layout';
import StatisticsView from '@/components/StatisticsView';
import ReportGenerator from '@/components/ReportGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

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
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="text-md">Übersicht</TabsTrigger>
            <TabsTrigger value="reports" className="text-md">Berichte & Rechnungen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <StatisticsView />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <ReportGenerator className="max-w-3xl mx-auto" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Statistics;
