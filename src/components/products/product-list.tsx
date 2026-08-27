
'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Search, Edit, Trash2, Eye, PlusCircle, Upload, Download, Power, LayoutGrid, Package, Layers, PowerOff, Lamp, Square, History, ArrowDownAZ, ArrowUpAZ, CalendarClock, ArrowUp, ArrowDown, CheckSquare, X, RefreshCw } from "lucide-react";
import { Product, ItemCategory } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProductDetailsModal from './product-details-modal';
import BulkStockModal from './bulk-stock-modal';
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
    onBulkDelete?: (productIds: string[]) => Promise<void>;
    onBulkUpdateStock?: (updates: { id: string; newStock: number }[], reason: string) => Promise<void>;
    onAddCategory: () => void;
    onViewStockHistory: (product: Product) => void;
}

const categoryIcons: { [key: string]: React.ReactElement } = {
    'STRIPLIGHT': <Layers className="h-4 w-4 text-blue-500" />,
    'POWER SUPPLY': <PowerOff className="h-4 w-4 text-green-500" />,
    'GENERAL LIGHTING': <Lamp className="h-4 w-4 text-yellow-500" />,
    'ALUMINIUM PROFILE': <Square className="h-4 w-4 text-gray-500" />,
};

type SortKey = 'name' | 'createdAt' | 'modifiedAt';
type SortDirection = 'asc' | 'desc';

export default function ProductList({ products, onEdit, onDelete, onBulkDelete, onBulkUpdateStock, onAddCategory, onViewStockHistory }: ProductListProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [isBulkStockModalOpen, setIsBulkStockModalOpen] = useState(false);
    const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [categories, setCategories] = useState<ItemCategory[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    const { hasWriteAccess } = useAuth();
    const canWrite = hasWriteAccess('Products');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const SortableHeader = ({ sortKey: key, children }: { sortKey: SortKey, children: React.ReactNode }) => {
        const isActive = sortKey === key;
        return (
            <TableHead onClick={() => handleSort(key)} className="cursor-pointer hover:bg-muted">
                <div className="flex items-center gap-2">
                    {children}
                    {isActive && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </div>
            </TableHead>
        );
    };

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
        const newStatus: Product['status'] = productToToggle.status === 'Discontinued' ? 'In Stock' : 'Discontinued';
        const updatedProduct = { ...productToToggle, status: newStatus };
        onEdit(updatedProduct); // This will trigger the parent's save logic. A bit of a hack for local state.
        toast({ title: 'Success', description: `Product has been ${newStatus === 'Discontinued' ? 'deactivated' : 'activated'}.`, variant: 'success' });
    }
    
    const filteredProducts = useMemo(() => {
        let sortedProducts = [...products].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            // Handle date sorting for both Date objects and Firestore Timestamps
            if (valA && valB && (valA instanceof Date || (valA as any).toDate) && (valB instanceof Date || (valB as any).toDate)) {
                const dateA = valA instanceof Date ? valA : (valA as any).toDate();
                const dateB = valB instanceof Date ? valB : (valB as any).toDate();
                return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            }

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            
            return 0;
        });

        return sortedProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, categoryFilter, sortKey, sortDirection]);

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

    const isAllSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.includes(p.id));
    const isSomeSelected = selectedProductIds.length > 0 && !isAllSelected;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = Array.from(new Set([...selectedProductIds, ...filteredProducts.map(p => p.id)]));
            setSelectedProductIds(allIds);
        } else {
            const filteredIds = new Set(filteredProducts.map(p => p.id));
            setSelectedProductIds(selectedProductIds.filter(id => !filteredIds.has(id)));
        }
    };

    const handleToggleSelectProduct = (productId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedProductIds(prev =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const selectedProductsList = useMemo(() => {
        return products.filter(p => selectedProductIds.includes(p.id));
    }, [products, selectedProductIds]);

    const handleConfirmBulkDelete = async () => {
        if (!onBulkDelete || selectedProductIds.length === 0) return;
        setIsBulkDeleting(true);
        try {
            await onBulkDelete(selectedProductIds);
            setSelectedProductIds([]);
            setIsBulkDeleteAlertOpen(false);
        } catch (error) {
            console.error("Bulk delete error:", error);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleExecuteBulkStockUpdate = async (updates: { id: string; newStock: number }[], reason: string) => {
        if (!onBulkUpdateStock) return;
        await onBulkUpdateStock(updates, reason);
        setSelectedProductIds([]);
    };
  
    if (!mounted) {
        return null;
    }

    return (
    <>
        <Card>
        <CardHeader className="p-4 sm:p-6">
            <Tabs defaultValue="products">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                <TabsList className="shrink-0">
                    <TabsTrigger value="products">Products ({filteredProducts.length})</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
                    <div className="relative w-full sm:w-[180px] md:w-[220px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search products..." 
                            className="pl-8 h-9 text-xs w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-9 text-xs w-full sm:w-[150px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <div className="flex items-center gap-2 text-xs">
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                    All Categories
                                </div>
                            </SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>
                                    <div className="flex items-center gap-2 text-xs">
                                        {categoryIcons[cat.name.toUpperCase()] || <Package className="h-3.5 w-3.5" />}
                                        {cat.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 px-3 text-xs text-purple-600 border-purple-600 hover:bg-purple-50 hover:text-purple-700" 
                        onClick={onAddCategory} 
                        disabled={!canWrite}
                    >
                        <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
                        Add Category
                    </Button>
                    <Button 
                        size="sm" 
                        className="h-9 px-3 text-xs" 
                        onClick={() => onEdit(null)} 
                        disabled={!canWrite}
                    >
                        <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                        Add Product
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9 shrink-0" 
                        title="Import"
                    >
                        <Upload className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9 shrink-0" 
                        title="Export"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <TabsContent value="products" className="mt-4">
                {/* Bulk Actions Banner */}
                {selectedProductIds.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50 duration-150">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                                {selectedProductIds.length}
                            </span>
                            <span className="text-xs font-medium text-blue-950 dark:text-blue-200">
                                {selectedProductIds.length} product{selectedProductIds.length === 1 ? '' : 's'} selected
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-700 dark:text-blue-300"
                                onClick={() => setIsBulkStockModalOpen(true)}
                                disabled={!canWrite}
                            >
                                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                Update Stock
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 px-2.5 text-xs bg-red-600 hover:bg-red-700"
                                onClick={() => setIsBulkDeleteAlertOpen(true)}
                                disabled={!canWrite}
                            >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Delete Selected ({selectedProductIds.length})
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setSelectedProductIds([])}
                            >
                                <X className="mr-1 h-3.5 w-3.5" />
                                Deselect
                            </Button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <Table className="mt-4 min-w-[850px]">
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[44px] px-2 text-center">
                            <Checkbox
                                checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
                                onCheckedChange={handleSelectAll}
                                aria-label="Select all products"
                            />
                        </TableHead>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <SortableHeader sortKey="name">Product</SortableHeader>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock Status</TableHead>
                        <SortableHeader sortKey="createdAt">Date Created</SortableHeader>
                        <SortableHeader sortKey="modifiedAt">Date Modified</SortableHeader>
                        <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => {
                        const createdAt = formatDateTime(product.createdAt);
                        const modifiedAt = formatDateTime(product.modifiedAt);
                        const stockStatus = getStockStatus(product.stock, product.reOrderLevel);
                        const isSelected = selectedProductIds.includes(product.id);
                        return (
                            <TableRow key={product.id} className={isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}>
                                <TableCell className="w-[44px] px-2 text-center" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => handleToggleSelectProduct(product.id)}
                                        aria-label={`Select product ${product.name}`}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                        <ProductImage 
                                            path={product.productImage}
                                            alt={product.name}
                                            width={40}
                                            height={40} 
                                            className="h-full w-full object-contain"
                                            data-ai-hint="product image"
                                        />
                                    </div>
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
                                        <Progress value={stockStatus.percentage} className="h-2 [&>*]:bg-none" style={{'--tw-bg-opacity': '1', backgroundColor: 'hsl(var(--muted))'} as React.CSSProperties}>
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

        {/* Bulk Delete Alert Dialog */}
        <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Delete {selectedProductIds.length} Selected Products?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. You are about to permanently delete <strong>{selectedProductIds.length}</strong> product{selectedProductIds.length === 1 ? '' : 's'} and remove their records from the database.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={handleConfirmBulkDelete}
                    disabled={isBulkDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    {isBulkDeleting ? 'Deleting...' : `Delete ${selectedProductIds.length} Products`}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Stock Adjustment Modal */}
        {isBulkStockModalOpen && (
            <BulkStockModal
                isOpen={isBulkStockModalOpen}
                onClose={() => setIsBulkStockModalOpen(false)}
                selectedProducts={selectedProductsList}
                onSave={handleExecuteBulkStockUpdate}
            />
        )}
    </>
  );
}
