
'use client';
import { useState } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Upload, ListPlus, Package, Edit, Trash2 } from "lucide-react";
import InventoryKpiCards from "@/components/inventory/inventory-kpi-cards";
import ActionCards from "@/components/inventory/action-cards";
import ProductsTab from "@/components/inventory/products-tab";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProductForm } from "@/components/inventory/product-form";
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog";
import type { Product } from '@/lib/types';
import { products as initialProducts, suppliers } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { Camera } from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddProduct = async (newProductData: Omit<Product, 'id' | 'status' | 'tags'>) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    const productToAdd: Product = {
      ...newProductData,
      id: `PROD${Date.now()}`,
      status: newProductData.initialStock > 0 ? (newProductData.initialStock < newProductData.minStock ? 'Low Stock' : 'In Stock') : 'Out of Stock',
      stock: newProductData.initialStock,
      tags: [],
      image: newProductData.image || `https://placehold.co/40x40.png?text=${newProductData.name.charAt(0)}`,
    };
    setProducts(prevProducts => [...prevProducts, productToAdd]);
    setIsSubmitting(false);
    setAddProductOpen(false);
    toast({
        title: "Product Added",
        description: `${newProductData.name} has been successfully added to your inventory.`,
    });
  };

  const handleEditProduct = async (updatedProductData: Omit<Product, 'id' | 'status' | 'tags'> & {image?: string}) => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    setProducts(prevProducts => prevProducts.map(p => p.id === editingProduct.id ? { 
        ...p, 
        ...updatedProductData, 
        stock: updatedProductData.initialStock,
        image: updatedProductData.image || p.image, // Keep old image if new one not provided
     } : p));
    setIsSubmitting(false);
    setEditingProduct(null);
    toast({
        title: "Product Updated",
        description: `${updatedProductData.name} has been successfully updated.`,
    });
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    setProducts(prevProducts => prevProducts.filter(p => p.id !== deletingProduct.id));
    setIsSubmitting(false);
    setDeletingProduct(null);
    toast({
        variant: "destructive",
        title: "Product Deleted",
        description: `${deletingProduct.name} has been removed from your inventory.`,
    });
  };
  
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
            <Button onClick={() => setAddProductOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button variant="outline">
              <ListPlus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />
      <InventoryKpiCards products={products} />
      <ActionCards onAddProduct={() => setAddProductOpen(true)} />
      <ProductsTab 
        products={products}
        categories={uniqueCategories}
        onAddProduct={() => setAddProductOpen(true)}
        onEditProduct={(product) => setEditingProduct(product)}
        onDeleteProduct={(product) => setDeletingProduct(product)}
      />
      
      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Add New Product with Smart Features
            </DialogTitle>
            <DialogDescription>
              Create a new product with image upload, automatic compression and intelligent validation
            </DialogDescription>
          </DialogHeader>
          <div className='flex-grow overflow-y-auto no-scrollbar'>
            <ProductForm 
              onSuccess={handleAddProduct} 
              onCancel={() => setAddProductOpen(false)}
              categories={uniqueCategories} 
              suppliers={supplierNames}
              isSubmitting={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(isOpen) => !isOpen && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Product
            </DialogTitle>
            <DialogDescription>
              Update the details of {editingProduct?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className='flex-grow overflow-y-auto no-scrollbar'>
            <ProductForm 
              onSuccess={handleEditProduct} 
              onCancel={() => setEditingProduct(null)}
              categories={uniqueCategories} 
              suppliers={supplierNames}
              isSubmitting={isSubmitting}
              product={editingProduct}
            />
          </div>
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
    </div>
  );
}
