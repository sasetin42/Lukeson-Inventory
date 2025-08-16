
'use client';
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InventoryTable from "./inventory-table";
import { Filter, Search } from "lucide-react";
import type { Product } from '@/lib/types';

interface ProductsTabProps {
    products: Product[];
    onAddProduct: () => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (product: Product) => void;
    loading?: boolean;
}

export default function ProductsTab({ products, onAddProduct, onEditProduct, onDeleteProduct, loading = false }: ProductsTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const getStatus = (product: Product) => {
        if (product.stock <= 0) return "Out of Stock";
        if (product.stock <= product.reorderLevel) return "Low Stock";
        return "In Stock";
    }

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const productStatus = getStatus(product);
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || productStatus === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [products, searchTerm, statusFilter]);
    
  return (
    <Tabs defaultValue="products">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="products">Products ({filteredProducts.length})</TabsTrigger>
          <TabsTrigger value="orders" disabled>Orders</TabsTrigger>
          <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search products by name or SKU..." 
                    className="pl-9 w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      <TabsContent value="products" className="mt-4">
        <InventoryTable 
            products={filteredProducts} 
            onAddProduct={onAddProduct}
            onEditProduct={onEditProduct}
            onDeleteProduct={onDeleteProduct}
            loading={loading}
        />
      </TabsContent>
    </Tabs>
  );
}
