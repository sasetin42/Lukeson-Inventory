
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { LayoutGrid, PlusCircle } from "lucide-react";
import CategoryList from "@/components/category/category-list";
import CategoryFormModal from "@/components/category/category-form-modal";
import { db } from '@/lib/firebase';
import { ref, onValue, push, set, serverTimestamp, update, remove, query, orderByChild, equalTo, get } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import type { ItemCategory } from '@/lib/types';

export default function CategoryPage() {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const categoriesRef = ref(db, "categories");
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      const categoriesData: ItemCategory[] = data ? Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as Omit<ItemCategory, 'id'>),
        createdAt: (value as ItemCategory).createdAt,
      })).sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()) : [];
      setCategories(categoriesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = (category: ItemCategory | null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAddCategory = async (newCategoryData: Omit<ItemCategory, 'id' | 'createdAt'>) => {
    try {
      const categoriesRef = ref(db, "categories");
      const newCategoryRef = push(categoriesRef);
      await set(newCategoryRef, {
        ...newCategoryData,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Success", description: "Category added successfully.", variant: "success" });
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Error", description: "Failed to add category.", variant: "destructive" });
    }
  };

  const handleUpdateCategory = async (categoryId: string, updatedCategoryData: Partial<ItemCategory>) => {
    try {
      const categoryRef = ref(db, `categories/${categoryId}`);
      await update(categoryRef, {
          ...updatedCategoryData,
          parentId: updatedCategoryData.parentId === 'none' ? null : updatedCategoryData.parentId
      });
      toast({ title: "Success", description: "Category updated successfully.", variant: "success" });
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({ title: "Error", description: "Failed to update category.", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (category: ItemCategory) => {
    // Check if category is a parent to any other category
    const isParent = categories.some(c => c.parentId === category.id);
    if (isParent) {
      toast({
        title: "Deletion Failed",
        description: "Cannot delete a category that is a parent to other categories.",
        variant: "destructive",
      });
      return;
    }

    // Check if any product is using this category
    const productsRef = query(ref(db, 'products'), orderByChild('category'), equalTo(category.name));
    const productSnap = await get(productsRef);
    if (productSnap.exists()) {
        toast({
            title: "Deletion Failed",
            description: `Cannot delete category. It is being used by ${productSnap.size} product(s).`,
            variant: "destructive"
        });
        return;
    }

    try {
      await remove(ref(db, `categories/${category.id}`));
      toast({ title: "Success", description: "Category deleted successfully.", variant: "success" });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({ title: "Error", description: "Failed to delete category.", variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Product Categories"
        description="Organize your products into categories."
        icon={<LayoutGrid className="h-6 w-6 text-red-500" />}
        actions={
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        }
      />
      <CategoryList 
        categories={categories} 
        onEdit={handleOpenModal} 
        onDelete={handleDeleteCategory} 
        loading={loading}
      />
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        category={editingCategory}
      />
    </div>
  );
}
