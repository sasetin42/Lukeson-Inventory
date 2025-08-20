
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Package, PlusCircle, Upload, Download, DollarSign, AlertTriangle, XCircle, Star, Clock } from "lucide-react";
import KpiCard from "@/components/kpi-card";
import ActionCard from "@/components/action-card";
import ProductList from "@/components/products/product-list";
import { Product, ItemCategory } from '@/lib/types';
import ProductFormModal from '@/components/products/product-form-modal';
import CategoryFormModal from '@/components/category/category-form-modal';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const productsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                } as Product;
            }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            setProducts(productsData);
            setLoading(false);
        }, (error) => {
            console.error("Failed to load products from Firestore", error);
            toast({ title: "Error", description: "Failed to load products.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const totalProducts = products.length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.reOrderLevel).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    
    const addedThisWeek = products.filter(p => {
        if (!p.createdAt) return false;
        const productDate = new Date(p.createdAt as any);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return productDate > sevenDaysAgo;
    }).length;

    const productKpis = [
        { title: "Total Products", value: totalProducts, icon: Package, subtext: "Total unique items", color: "blue" as const },
        { title: "Total Value", value: `₱${totalValue.toLocaleString()}`, icon: DollarSign, subtext: "Value of all stock", color: "green" as const },
        { title: "Low Stock", value: lowStock, icon: AlertTriangle, subtext: "Items needing reorder", color: "yellow" as const },
        { title: "Out of Stock", value: outOfStock, icon: XCircle, subtext: "Items unavailable", color: "red" as const },
        { title: "Added This Week", value: addedThisWeek, icon: Star, subtext: "New products onboarded", color: "purple" as const },
        { title: "Pending Orders", value: 0, icon: Clock, subtext: "Awaiting fulfillment", color: "orange" as const }
    ];

    const handleOpenProductModal = (product: Product | null) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };
    
    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
    }

    const handleDeleteProduct = async (productToDelete: Product) => {
        try {
            await deleteDoc(doc(db, 'products', productToDelete.id));
            toast({ title: "Success", description: "Product deleted.", variant: "success" });
        } catch (error) {
            console.error("Error deleting product: ", error);
            toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
        }
    }

    const handleProductSave = async (savedProductData: Omit<Product, 'id' | 'createdAt'> & {id?: string}) => {
      try {
          if (savedProductData.id) {
              const docRef = doc(db, 'products', savedProductData.id);
              const { id, ...dataToSave } = savedProductData;
              await setDoc(docRef, dataToSave, { merge: true });
          } else {
              await addDoc(collection(db, 'products'), {
                  ...savedProductData,
                  createdAt: serverTimestamp()
              });
          }
      } catch (error) {
          console.error("Error saving product:", error);
          toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
      }
    }

    const handleCategorySave = async (savedCategory: Omit<ItemCategory, 'id' | 'createdAt'> & {id?: string}) => {
        try {
            if (savedCategory.id) {
                const docRef = doc(db, 'categories', savedCategory.id);
                const { id, ...dataToSave } = savedCategory;
                await setDoc(docRef, dataToSave, { merge: true });
                toast({ title: "Success", description: "Category updated successfully.", variant: "success" });
            } else {
                await addDoc(collection(db, 'categories'), {
                    ...savedCategory,
                    createdAt: serverTimestamp()
                });
                toast({ title: "Success", description: "Category added successfully.", variant: "success" });
            }
            setIsCategoryModalOpen(false);
        } catch (error) {
             console.error("Error saving category:", error);
            toast({ title: "Error", description: "Failed to save category.", variant: "destructive" });
        }
    }


  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Products Overview"
        description="Complete inventory management with clickable widgets and analytics"
        icon={<Package className="h-6 w-6" />}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {productKpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            subtext={kpi.subtext}
            color={kpi.color}
          />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ActionCard 
            title="Add Product" 
            description="Create new inventory item" 
            icon="plus"
            onClick={() => handleOpenProductModal(null)}
            color="blue"
        />
        <ActionCard 
            title="Adjust Stock" 
            description="Modify inventory levels" 
            icon="repeat"
            href="#"
            color="green"
        />
        <ActionCard 
            title="Create PO" 
            description="New purchase order" 
            icon="cart"
            href="#"
            color="purple"
        />
        <ActionCard 
            title="Stock Alerts" 
            description={`${lowStock} active alerts`} 
            icon="alert"
            href="#"
            color="red"
        />
      </div>
      <ProductList 
        products={products} 
        onEdit={handleOpenProductModal} 
        onDelete={handleDeleteProduct}
        onAddCategory={() => setIsCategoryModalOpen(true)}
      />

      {isProductModalOpen && (
          <ProductFormModal 
            isOpen={isProductModalOpen}
            onClose={handleCloseProductModal}
            product={editingProduct}
            onSave={handleProductSave as any}
          />
      )}

      {isCategoryModalOpen && (
        <CategoryFormModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onSave={handleCategorySave as any}
            category={null}
        />
      )}
      
    </div>
  );
}
