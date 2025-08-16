
'use client';
import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Upload, Package, Edit, Trash2 } from "lucide-react";
import InventoryKpiCards from "@/components/inventory/inventory-kpi-cards";
import ActionCards from "@/components/inventory/action-cards";
import ProductsTab from "@/components/inventory/products-tab";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProductForm } from "@/components/inventory/product-form";
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog";
import type { Product } from '@/lib/types';
import { suppliers } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import { Camera } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addProduct, getProducts, updateProduct, deleteProduct } from '@/lib/firebase/product-service';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const unsubscribe = getProducts((products) => {
          setProducts(products);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Error fetching products",
          description: "Could not load product data. Please check your Firestore connection and rules.",
        });
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const handleAddProduct = async (data: any) => {
    setIsSubmitting(true);
    try {
      await addProduct(data);
      toast({
        title: "Product Added",
        description: `${data.name} has been successfully added.`,
      });
      setAddProductOpen(false);
    } catch (error: any) {
      console.error("Error adding product: ", error);
      toast({
        variant: "destructive",
        title: "Error Adding Product",
        description: error.message || "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data: any) => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      await updateProduct(editingProduct.id, data);
      toast({
        title: "Product Updated",
        description: `${data.name} has been successfully updated.`,
      });
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Error updating product: ", error);
      toast({
        variant: "destructive",
        title: "Error Updating Product",
        description: error.message || "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      await deleteProduct(deletingProduct.id, deletingProduct.imageUrl);
      toast({
        title: "Product Deleted",
        description: `${deletingProduct.name} has been successfully deleted.`,
      });
      setDeletingProduct(null);
    } catch (error: any) {
      console.error("Error deleting product: ", error);
      toast({
        variant: "destructive",
        title: "Error Deleting Product",
        description: error.message || "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const supplierNames = suppliers.map(s => s.name);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Products Overview" 
        description="Complete inventory management with clickable widgets and analytics"
        icon={<Package className="h-6 w-6 text-blue-500" />}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => { setEditingProduct(null); setAddProductOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
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
        onAddProduct={() => { setEditingProduct(null); setAddProductOpen(true); }}
        onEditProduct={(product) => setEditingProduct(product)}
        onDeleteProduct={(product) => setDeletingProduct(product)}
      />
      
       {isAddProductOpen && (
        <Dialog open={isAddProductOpen} onOpenChange={setAddProductOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Add New Product with Smart Features
              </DialogTitle>
              <DialogDescription>
                Enter product details below.
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
      )}

      {/* Edit Product Dialog */}
      {editingProduct && (
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
      )}
      
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

