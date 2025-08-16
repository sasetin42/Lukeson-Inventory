
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { List, PlusCircle } from "lucide-react";
import CategoryList from "@/components/category/category-list";
import { AddCategoryDialog } from '@/components/inventory/add-category-dialog';
import type { Category } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddCategoryOpen, setAddCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(categoriesData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddCategory = async (data: Omit<Category, 'id'>) => {
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, 'categories'), {
            ...data,
            createdAt: serverTimestamp(),
        });
        toast({
            title: "Category Added",
            description: `Category "${data.name}" has been successfully added.`,
        });
        setAddCategoryOpen(false);
    } catch (error) {
        console.error("Error adding category: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not add the category. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader 
        title="Category Management" 
        description="Organize your products with hierarchical categories"
        icon={<List className="h-6 w-6 text-orange-500" />}
        actions={
          <Button onClick={() => setAddCategoryOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />
      <CategoryList categories={categories} />

      {isAddCategoryOpen && (
        <AddCategoryDialog
            open={isAddCategoryOpen}
            onOpenChange={setAddCategoryOpen}
            onConfirm={handleAddCategory}
            isSubmitting={isSubmitting}
            existingCategories={categories}
        />
      )}
    </div>
  );
}
