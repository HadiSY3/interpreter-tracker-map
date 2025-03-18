
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import CategoryManager from '@/components/CategoryManager';
import { Category, initialCategories } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const handleAddCategory = (category: Category) => {
    setCategories([...categories, category]);
  };

  const handleUpdateCategory = (category: Category) => {
    setCategories(categories.map(c => 
      c.id === category.id ? category : c
    ));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategorien</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie die verschiedenen Einsatzkategorien und die zugehörigen Vergütungssätze.
          </p>
        </div>

        <CategoryManager 
          categories={categories}
          onCategoryAdd={handleAddCategory}
          onCategoryUpdate={handleUpdateCategory}
          onCategoryDelete={handleDeleteCategory}
        />
      </div>
    </Layout>
  );
};

export default Categories;
