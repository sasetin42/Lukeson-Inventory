
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Package, PlusCircle, Upload, Download, DollarSign, AlertTriangle, XCircle, Star, Clock } from "lucide-react";
import KpiCard from "@/components/kpi-card";
import ActionCard from "@/components/action-card";
import ProductList from "@/components/products/product-list";
import { Product } from '@/lib/types';
import ProductFormModal from '@/components/products/product-form-modal';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            const productsData: Product[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                productsData.push({ 
                    id: doc.id, 
                    ...data,
                    createdAt: data.createdAt?.toDate()?.toISOString(),
                } as Product);
            });
            setProducts(productsData.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime()));
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

    const handleOpenModal = (product: Product | null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAddProduct = async (newProductData: Omit<Product, 'id' | 'createdAt' | 'status'>) => {
        try {
            const stockStatus = newProductData.stock > 0 
                ? (newProductData.stock <= newProductData.reOrderLevel ? 'Low Stock' : 'In Stock')
                : 'Out of Stock';

            await addDoc(collection(db, "products"), {
                ...newProductData,
                createdAt: serverTimestamp(),
                status: stockStatus,
            });
            toast({ title: "Success", description: "Product added successfully.", variant: "success" });
        } catch (error) {
            console.error("Error adding product:", error);
            toast({ title: "Error", description: "Failed to add product.", variant: "destructive" });
            throw error;
        }
    };

    const handleUpdateProduct = async (productId: string, updatedProductData: Partial<Product>) => {
        try {
            const productRef = doc(db, 'products', productId);
            
            const currentProduct = products.find(p => p.id === productId);
            if (!currentProduct) throw new Error("Product not found");

            const stock = updatedProductData.stock ?? currentProduct.stock;
            const reOrderLevel = updatedProductData.reOrderLevel ?? currentProduct.reOrderLevel;

            const newStatus = stock > 0
                ? (stock <= reOrderLevel ? 'Low Stock' : 'In Stock')
                : 'Out of Stock';
            
            await updateDoc(productRef, {
                ...updatedProductData,
                status: updatedProductData.status || newStatus
            });
            toast({ title: "Success", description: "Product updated successfully.", variant: "success" });
        } catch (error) {
            console.error("Error updating product:", error);
            toast({ title: "Error", description: "Failed to update product.", variant: "destructive" });
            throw error;
        }
    };

    const handleDeleteProduct = async (product: Product) => {
        try {
            await deleteDoc(doc(db, "products", product.id));
            toast({ title: "Success", description: "Product deleted successfully.", variant: "success" });
        } catch (error) {
            console.error("Error deleting document: ", error);
            toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
        }
    }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Products Overview"
        description="Complete inventory management with clickable widgets and analytics"
        icon={<Package className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => handleOpenModal(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
            </Button>
            <Button variant="ghost">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="ghost">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
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
            onClick={() => handleOpenModal(null)}
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
      <ProductList products={products} onEdit={handleOpenModal} onDelete={handleDeleteProduct} />

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        product={editingProduct}
        totalProducts={products.length}
      />
    </div>
  );
}
