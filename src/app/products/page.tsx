
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
import { useToast } from '@/hooks/use-toast';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                const productsData = JSON.parse(storedProducts).map((p: any) => ({
                    ...p,
                    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
                })).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
                setProducts(productsData);
            }
        } catch (error) {
            console.error("Failed to load products from localStorage", error);
            toast({ title: "Error", description: "Failed to load products.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, []);

    const persistProducts = (updatedProducts: Product[]) => {
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        setProducts(updatedProducts.map(p => ({ ...p, createdAt: new Date(p.createdAt) })).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    };
    
    const totalProducts = products.length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.reOrderLevel).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    
    const addedThisWeek = products.filter(p => {
        if (!p.createdAt) return false;
        const productDate = new Date(p.createdAt);
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
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    }

    const handleDeleteProduct = async (productToDelete: Product) => {
        try {
            const updatedProducts = products.filter(p => p.id !== productToDelete.id);
            persistProducts(updatedProducts);
            toast({ title: "Success", description: "Product deleted.", variant: "success" });
        } catch (error) {
            console.error("Error deleting product: ", error);
            toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
        }
    }

    const handleProductSave = (savedProduct: Product) => {
      const existing = products.find(p => p.id === savedProduct.id);
      let updatedProducts;
      if (existing) {
        updatedProducts = products.map(p => p.id === savedProduct.id ? savedProduct : p);
      } else {
        updatedProducts = [...products, savedProduct];
      }
      persistProducts(updatedProducts);
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
      <ProductList 
        products={products} 
        onEdit={handleOpenModal} 
        onDelete={handleDeleteProduct} 
      />

      {isModalOpen && (
          <ProductFormModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            product={editingProduct}
            onSave={handleProductSave}
          />
      )}
    </div>
  );
}
