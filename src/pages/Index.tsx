
import React from 'react';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8 pb-8">
        <Hero className="mb-8" />
        <Dashboard />
      </div>
    </Layout>
  );
};

export default Index;
