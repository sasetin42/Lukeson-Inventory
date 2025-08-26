
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, Edit, Trash2, Eye, PlusCircle, Upload, Download, Power, LayoutGrid, Package, Layers, PowerOff, Lamp, Square, History } from "lucide-react";
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
import ProductImage from './product-image';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Progress } from '../ui/progress';
import { useAuth } from '@/context/auth-context';

interface ProductListProps {
    products: Product[];
    onEdit: (product: Product | null) => void;
    onDelete: (product: Product) => void;
    onAddCategory: () => void;
    onViewStockHistory: (product: Product) => void;
}

const categoryIcons: { [key: string]: React.ReactElement } = {
    'STRIPLIGHT': <Layers className="h-4 w-4 text-blue-500" />,
    'POWER SUPPLY': <PowerOff className="h-4 w-4 text-green-500" />,
    'GENERAL LIGHTING': <Lamp className="h-4 w-4 text-yellow-500" />,
    'ALUMINIUM PROFILE': <Square className="h-4 w-4 text-gray-500" />,
};

export default function ProductList({ products, onEdit, onDelete, onAddCategory, onViewStockHistory }: ProductListProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    const { hasWriteAccess } = useAuth();
    const canWrite = hasWriteAccess('Products');

    useEffect(() => {
        setMounted(true);
        const fetchCategories = async () => {
          try {
            const categoriesRef = collection(db, 'categories');
            const snapshot = await getDocs(categoriesRef);
            const loadedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ItemCategory));
            setCategories(loadedCategories);
          } catch (error) {
            console.error("Failed to fetch categories", error);
          }
        };
        fetchCategories();
    }, []);

    const formatDateTime = (date: any) => {
        if (!date) return { date: 'N/A', time: '' };
        const d = date.toDate ? date.toDate() : new Date(date);
        return {
            date: format(d, 'PP'),
            time: format(d, 'pp')
        };
    }

    const openDeleteAlert = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteAlertOpen(true);
    }

    const handleDelete = () => {
        if (!productToDelete) return;
        onDelete(productToDelete);
        setIsDeleteAlertOpen(false);
        setProductToDelete(null);
    };

    const handleToggleStatus = (productToToggle: Product) => {
        const newStatus = productToToggle.status === 'Discontinued' ? 'In Stock' : 'Discontinued';
        const updatedProduct = { ...productToToggle, status: newStatus };
        onEdit(updatedProduct); // This will trigger the parent's save logic. A bit of a hack for local state.
        toast({ title: 'Success', description: `Product has been ${newStatus === 'Discontinued' ? 'deactivated' : 'activated'}.`, variant: 'success' });
    }
    
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => (a.productCode || '').localeCompare(b.productCode || ''));
    }, [products, searchQuery, categoryFilter]);

    const getStockStatus = (stock: number, reOrderLevel: number) => {
        const maxStock = reOrderLevel * 5; // Assuming max stock is 5x re-order level
        const percentage = (stock / maxStock) * 100;

        let color = "#2463EB"; // Healthy stock
        if (stock <= reOrderLevel) {
            color = "#EF4444"; // Re-order level
        } else if (stock <= reOrderLevel * 2.5) {
            color = "#22C55E"; // Half stock
        }

        return {
            percentage: Math.min(percentage, 100),
            color: color
        }
    }
  
    if (!mounted) {
        return null;
    }

    return (
    <>
        <Card>
        <CardHeader>
            <Tabs defaultValue="products">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <TabsList>
                <TabsTrigger value="products">Products ({filteredProducts.length})</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search products..." 
                        className="pl-10 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            All Categories
                        </div>
                    </SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>
                            <div className="flex items-center gap-2">
                                {categoryIcons[cat.name.toUpperCase()] || <Package className="h-4 w-4" />}
                                {cat.name}
                            </div>
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>
            <TabsContent value="products" className="mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div>
                        <CardTitle>Products</CardTitle>
                        <CardDescription>Your current inventory of products.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50 hover:text-purple-700" onClick={onAddCategory} disabled={!canWrite}>
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                        <Button onClick={() => onEdit(null)} disabled={!canWrite}>
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
                <div className="overflow-x-auto">
                    <Table className="mt-4 min-w-[800px]">
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock Status</TableHead>
                        <TableHead>Date Created</TableHead>
                        <TableHead>Date Modified</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => {
                        const createdAt = formatDateTime(product.createdAt);
                        const modifiedAt = formatDateTime(product.modifiedAt);
                        const stockStatus = getStockStatus(product.stock, product.reOrderLevel);
                        return (
                            <TableRow key={product.id}>
                                <TableCell>
                                <ProductImage 
                                    path={product.productImage}
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
                                    <div className="text-[12px] text-muted-foreground">SKU: {product.sku}</div>
                                </TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>₱{product.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 w-[100px]">
                                        <span>{product.stock} units</span>
                                        <Progress value={stockStatus.percentage} className="h-2 [&>*]:bg-none" style={{'--tw-bg-opacity': '1', backgroundColor: 'hsl(var(--muted))'}}>
                                        <div className={`h-full rounded-full`} style={{ width: `${stockStatus.percentage}%`, backgroundColor: stockStatus.color }} />
                                        </Progress>
                                    </div>
                                </TableCell>
                                <TableCell>
                                <div>{createdAt.date}</div>
                                <div className="text-muted-foreground" style={{fontSize: '12px'}}>{createdAt.time}</div>
                                </TableCell>
                                <TableCell>
                                <div>{modifiedAt.date}</div>
                                <div className="text-muted-foreground" style={{fontSize: '12px'}}>{modifiedAt.time}</div>
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
                                        <Eye className="mr-2 h-4 w-4 text-blue-500" />
                                        View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onViewStockHistory(product)}>
                                        <History className="mr-2 h-4 w-4 text-purple-500" />
                                        Stock History
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openDeleteAlert(product)} disabled={!canWrite}>
                                        <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                        Delete
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                        })}
                    </TableBody>
                    </Table>
                </div>
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
            onToggleStatus={handleToggleStatus}
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
