
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
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const { toast } = useToast();
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const productsRef = collection(db, 'products');
            const categoriesRef = collection(db, 'categories');

            const productsSnapshot = await getDocs(productsRef);
            const loadedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(loadedProducts);

            const categoriesSnapshot = await getDocs(categoriesRef);
            const loadedCategories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ItemCategory));
            setCategories(loadedCategories);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({
                title: "Error",
                description: "Failed to load product data. Please check permissions.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);
    
    const totalProducts = products.length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.reOrderLevel).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    
    const addedThisWeek = products.filter(p => {
        if (!p.createdAt) return false;
        const createdAtDate = (p.createdAt as any).toDate ? (p.createdAt as any).toDate() : new Date(p.createdAt as string);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return createdAtDate > sevenDaysAgo;
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
        await deleteDoc(doc(db, "products", productToDelete.id));
        toast({ title: "Success", description: "Product deleted.", variant: "success" });
        fetchData(); // Refetch data
    }

    const handleProductSave = async (productData: Omit<Product, 'id' | 'createdAt'> & {id?: string; imageFile?: File | null}) => {
        const { imageFile, id, ...dataToSave } = productData;
        
        // In a real app, you would handle image uploads to a storage service like Firebase Storage
        // and get back a URL. For now, we will continue using a placeholder or existing URL.
        const imageUrl = productData.productImage || 'https://placehold.co/300x300.png';

        const finalData = { ...dataToSave, productImage: imageUrl };

        try {
            if (id) {
                // This is an existing product, update it.
                const productRef = doc(db, "products", id);
                await updateDoc(productRef, { ...finalData, modifiedAt: serverTimestamp() });
                toast({ title: "Success", description: "Product updated successfully.", variant: "success" });
            } else {
                // This is a new product, create it.
                await addDoc(collection(db, "products"), { ...finalData, createdAt: serverTimestamp(), modifiedAt: serverTimestamp() });
                toast({ title: "Success", description: "Product added successfully.", variant: "success" });
            }
            handleCloseProductModal();
            fetchData(); // Refetch data
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
        }
    }

    const handleCategorySave = async (categoryData: Omit<ItemCategory, 'id' | 'createdAt'> & {id?: string, imageFile?: File | null}) => {
        const { imageFile, id, ...dataToSave } = categoryData;
        let imageUrl = categoryData.productImage || 'https://placehold.co/300x300.png';
            
        // Again, placeholder for image handling
        const finalData = { ...dataToSave, productImage: imageUrl };

        try {
            if (id) {
                const categoryRef = doc(db, "categories", id);
                await setDoc(categoryRef, finalData, { merge: true });
                toast({ title: "Success", description: "Category updated successfully.", variant: "success" });
            } else {
                await addDoc(collection(db, "categories"), { ...finalData, createdAt: serverTimestamp() });
                toast({ title: "Success", description: "Category added successfully.", variant: "success" });
            }
            fetchData(); // Refetch data
        } catch(error) {
            toast({ title: "Error", description: "Failed to save category.", variant: "destructive" });
        }
    }

    const handleCategoryDelete = async (categoryId: string) => {
        await deleteDoc(doc(db, `categories/${categoryId}`));
        toast({ title: "Success", description: "Category deleted successfully.", variant: "success" });
        fetchData(); // Refetch data
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
            onSave={handleProductSave}
          />
      )}

      {isCategoryModalOpen && (
        <CategoryFormModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onSave={handleCategorySave}
            onDelete={handleCategoryDelete}
            category={editingCategory}
            categories={categories}
        />
      )}
      
    </div>
  );
}
