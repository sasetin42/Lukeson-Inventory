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
    categories: string[];
    onAddProduct: () => void;
}

export default function ProductsTab({ products, categories, onAddProduct }: ProductsTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  product.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [products, searchTerm, categoryFilter, statusFilter]);
    
  return (
    <Tabs defaultValue="products">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="products">Products ({filteredProducts.length})</TabsTrigger>
          <TabsTrigger value="categories">Categories (1)</TabsTrigger>
          <TabsTrigger value="orders">Orders (2)</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
        <InventoryTable products={filteredProducts} onAddProduct={onAddProduct} />
      </TabsContent>
      <TabsContent value="categories">
        Categories content
      </TabsContent>
      <TabsContent value="orders">
        Orders content
      </TabsContent>
      <TabsContent value="analytics">
        Analytics content
      </TabsContent>
    </Tabs>
  );
}
