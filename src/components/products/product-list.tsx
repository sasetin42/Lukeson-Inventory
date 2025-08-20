
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, Edit, Trash2, Eye, PlusCircle, Upload, Download } from "lucide-react";
import { Product, ItemCategory } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProductDetailsModal from './product-details-modal';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProductImage from './product-image';

interface ProductListProps {
    products: Product[];
    onEdit: (product: Product | null) => void;
    onDelete: (product: Product) => void;
}

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        const categoriesUnsub = onSnapshot(collection(db, "categories"), (snapshot) => {
            const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ItemCategory));
            setCategories(categoriesData);
        });

        return () => categoriesUnsub();
    }, []);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'In Stock':
                return 'default';
            case 'Low Stock':
                return 'secondary';
            case 'Out of Stock':
            case 'Discontinued':
                return 'destructive';
            default:
                return 'outline';
        }
    };
    
    const openDeleteAlert = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteAlertOpen(true);
    }

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            await onDelete(productToDelete);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
        } finally {
            setIsDeleteAlertOpen(false);
            setProductToDelete(null);
        }
    };
    
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  product.sku.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, categoryFilter]);
  
    return (
    <>
        <Card>
        <CardHeader>
            <Tabs defaultValue="products">
            <div className="flex justify-between items-center">
                <TabsList>
                <TabsTrigger value="products">Products ({filteredProducts.length})</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search products by name or SKU..." 
                        className="pl-10 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>
            <TabsContent value="products" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <CardTitle>Products</CardTitle>
                        <CardDescription>Your current inventory of products.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => onEdit(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Product
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
                </div>
                <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell>
                        <ProductImage 
                            path={product.imageUpload}
                            alt={product.name}
                            width={48}
                            height={48} 
                            className="rounded-md"
                            data-ai-hint="product image"
                        />
                        </TableCell>
                        <TableCell>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.productCode}</div>
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>₱{product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                        <Badge variant={getStatusVariant(product.status)}>{product.status}</Badge>
                        </TableCell>
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedProduct(product)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteAlert(product)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                 {filteredProducts.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No products found.
                    </div>
                )}
            </TabsContent>
            </Tabs>
        </CardHeader>
        <ProductDetailsModal
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            product={selectedProduct}
            onEdit={onEdit}
            onDelete={openDeleteAlert}
        />
        </Card>
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the product
                    and remove its data from our servers.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
