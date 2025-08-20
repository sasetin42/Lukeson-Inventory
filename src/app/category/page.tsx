
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { LayoutGrid, PlusCircle } from "lucide-react";
import CategoryList from "@/components/category/category-list";
import CategoryFormModal from "@/components/category/category-form-modal";
import { useToast } from '@/hooks/use-toast';
import type { ItemCategory } from '@/lib/types';

export default function CategoryPage() {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCategories = localStorage.getItem('categories');
      if (storedCategories) {
        const categoriesData = JSON.parse(storedCategories).map((c: any) => ({
          ...c,
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        })).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error("Failed to load categories from localStorage", error);
      toast({ title: "Error", description: "Failed to load categories.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenModal = (category: ItemCategory | null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const persistCategories = (updatedCategories: ItemCategory[]) => {
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    })).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const handleAddCategory = async (newCategoryData: Omit<ItemCategory, 'id' | 'createdAt'>) => {
    try {
      const newCategory: ItemCategory = {
        ...newCategoryData,
        id: new Date().toISOString(),
        createdAt: new Date(),
      };
      const updatedCategories = [...categories, newCategory];
      persistCategories(updatedCategories);
      toast({ title: "Success", description: "Category added successfully.", variant: "success" });
    } catch (error) {
      console.error("Error adding category: ", error);
      toast({ title: "Error", description: "Failed to add category.", variant: "destructive" });
    }
  };

  const handleUpdateCategory = async (categoryId: string, updatedCategoryData: Partial<ItemCategory>) => {
    try {
      const updatedCategories = categories.map(c => 
        c.id === categoryId ? { ...c, ...updatedCategoryData } : c
      );
      persistCategories(updatedCategories);
      toast({ title: "Success", description: "Category updated successfully.", variant: "success" });
    } catch (error) {
      console.error("Error updating category: ", error);
      toast({ title: "Error", description: "Failed to update category.", variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (category: ItemCategory) => {
    const isParent = categories.some(c => c.parentId === category.id);
    if (isParent) {
      toast({
        title: "Deletion Failed",
        description: `Cannot delete a category that is a parent to other categories.`,
        variant: "destructive",
      });
      return;
    }
    
    const productsRaw = localStorage.getItem('products');
    const products = productsRaw ? JSON.parse(productsRaw) : [];
    const isProductUsingCategory = products.some((p: any) => p.category === category.name);
    if(isProductUsingCategory) {
       toast({
            title: "Deletion Failed",
            description: `Cannot delete category. It is being used by product(s).`,
            variant: "destructive"
        });
        return;
    }


    try {
      const updatedCategories = categories.filter(c => c.id !== category.id);
      persistCategories(updatedCategories);
      toast({ title: "Success", description: "Category deleted successfully.", variant: "success" });
    } catch (error) {
      console.error("Error deleting category: ", error);
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
