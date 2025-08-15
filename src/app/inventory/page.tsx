'use client';
import { useState } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Upload, ListPlus, Package } from "lucide-react";
import InventoryKpiCards from "@/components/inventory/inventory-kpi-cards";
import ActionCards from "@/components/inventory/action-cards";
import ProductsTab from "@/components/inventory/products-tab";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddProductForm } from "@/components/inventory/add-product-form";
import type { Product } from '@/lib/types';
import { products as initialProducts, suppliers } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { Camera } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const { toast } = useToast();

  const handleAddProduct = (newProduct: Omit<Product, 'id' | 'status' | 'tags'>) => {
    const productToAdd: Product = {
      ...newProduct,
      id: `PROD${Date.now()}`,
      status: newProduct.initialStock > 0 ? (newProduct.initialStock < newProduct.minStock ? 'Low Stock' : 'In Stock') : 'Out of Stock',
      stock: newProduct.initialStock,
      tags: [],
    };
    setProducts(prevProducts => [...prevProducts, productToAdd]);
    setAddProductOpen(false);
    toast({
        title: "Product Added",
        description: `${newProduct.name} has been successfully added to your inventory.`,
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
      />
      
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
            <AddProductForm 
              onSuccess={handleAddProduct} 
              categories={uniqueCategories} 
              suppliers={supplierNames}
              onCancel={() => setAddProductOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
