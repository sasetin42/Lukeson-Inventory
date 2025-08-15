
'use client';
import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Upload, ListPlus, Package, Edit, Trash2 } from "lucide-react";
import InventoryKpiCards from "@/components/inventory/inventory-kpi-cards";
import ActionCards from "@/components/inventory/action-cards";
import ProductsTab from "@/components/inventory/products-tab";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProductForm } from "@/components/inventory/product-form";
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog";
import type { Product, Category } from '@/lib/types';
import { suppliers } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { Camera } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddCategoryDialog } from '@/components/inventory/add-category-dialog';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setAddCategoryOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
    });

    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(categoriesData);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  const handleAddProduct = async (data: any) => {
    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (data.image && typeof data.image === 'string' && data.image.startsWith('data:image')) {
        const storageRef = ref(storage, `products/${Date.now()}_${data.name.replace(/\s+/g, '-')}.webp`);
        const snapshot = await uploadString(storageRef, data.image, 'data_url');
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const { image, ...restOfData } = data;

      await addDoc(collection(db, 'products'), {
        ...restOfData,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Product Added",
        description: `${data.name} has been successfully added.`,
      });
      setAddProductOpen(false);
    } catch (error) {
      console.error("Error adding product: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add the product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data: any) => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      let imageUrl = editingProduct.imageUrl || '';
      // Check if a new image is being uploaded
      if (data.image && data.image.startsWith('data:image')) {
        // Delete old image if it exists
        if (editingProduct.imageUrl) {
          try {
            const oldImageRef = ref(storage, editingProduct.imageUrl);
            await deleteObject(oldImageRef);
          } catch (storageError) {
             // If the old image doesn't exist, we can ignore the error and proceed.
            if ((storageError as any).code !== 'storage/object-not-found') {
                throw storageError; // Re-throw other errors
            }
          }
        }
        // Upload new image
        const storageRef = ref(storage, `products/${Date.now()}_${data.name.replace(/\s+/g, '-')}.webp`);
        const snapshot = await uploadString(storageRef, data.image, 'data_url');
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const { image, ...restOfData } = data;
      const productRef = doc(db, 'products', editingProduct.id);
      
      await updateDoc(productRef, {
        ...restOfData,
        imageUrl,
      });

      toast({
        title: "Product Updated",
        description: `${data.name} has been successfully updated.`,
      });
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update the product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      // Delete image from storage
      if (deletingProduct.imageUrl) {
        try {
            const imageRef = ref(storage, deletingProduct.imageUrl);
            await deleteObject(imageRef);
        } catch (storageError) {
             if ((storageError as any).code !== 'storage/object-not-found') {
                throw storageError;
            }
        }
      }

      // Delete product from firestore
      await deleteDoc(doc(db, 'products', deletingProduct.id));

      toast({
        variant: "destructive",
        title: "Product Deleted",
        description: `${deletingProduct.name} has been removed.`,
      });
      setDeletingProduct(null);
    } catch (error) {
      console.error("Error deleting product: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
  
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  const supplierNames = suppliers.map(s => s.name);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Inventory Overview" 
        description="Complete inventory management with clickable widgets and analytics"
        icon={<Package className="h-6 w-6 text-blue-500" />}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => { setEditingProduct(null); setAddProductOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button variant="outline" onClick={() => setAddCategoryOpen(true)}>
              <ListPlus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Exporting Products", description: "Your products are being exported."})}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Importing Products", description: "Your products are being imported."})}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />
      <InventoryKpiCards products={products} />
      <ActionCards onAddProduct={() => { setEditingProduct(null); setAddProductOpen(true); }} />
      <ProductsTab 
        products={products}
        categories={uniqueCategories}
        onAddProduct={() => { setEditingProduct(null); setAddProductOpen(true); }}
        onEditProduct={(product) => setEditingProduct(product)}
        onDeleteProduct={(product) => setDeletingProduct(product)}
      />
      
      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Add New Product with Smart Features
            </DialogTitle>
            <DialogDescription>
              Select a category to see category-specific fields.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className='flex-grow overflow-y-auto no-scrollbar pr-2'>
            <ProductForm 
              onSuccess={handleAddProduct} 
              onCancel={() => setAddProductOpen(false)}
              suppliers={supplierNames}
              isSubmitting={isSubmitting}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(isOpen) => !isOpen && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Product
            </DialogTitle>
            <DialogDescription>
              Update the details of {editingProduct?.name}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className='flex-grow overflow-y-auto no-scrollbar pr-2'>
            <ProductForm 
              onSuccess={handleEditProduct} 
              onCancel={() => setEditingProduct(null)}
              suppliers={supplierNames}
              isSubmitting={isSubmitting}
              product={editingProduct}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Delete Product Dialog */}
      <DeleteProductDialog
        open={!!deletingProduct}
        onOpenChange={(isOpen) => !isOpen && setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
        productName={deletingProduct?.name || ''}
        isSubmitting={isSubmitting}
      />

      {/* Add Category Dialog */}
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
