
'use client';

import { useState, useEffect } from 'react';
import PageHeader from "@/components/page-header";
import { AlertTriangle, Download, Package, ShoppingCart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ProductImage from '@/components/products/product-image';
import KpiCard from '@/components/kpi-card';

export default function StockAlertsPage() {
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStockData = async () => {
            setLoading(true);
            try {
                const productsRef = collection(db, 'products');

                // Can't use inequality on different fields, so we fetch all and filter client-side.
                // For larger datasets, this should be handled differently (e.g. a 'status' field).
                const productsSnapshot = await getDocs(productsRef);
                const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                
                const lowStock = allProducts.filter(p => p.stock > 0 && p.stock <= p.reOrderLevel);
                const outOfStock = allProducts.filter(p => p.stock === 0);

                setLowStockProducts(lowStock);
                setOutOfStockProducts(outOfStock);

            } catch (error) {
                console.error("Error fetching stock data: ", error);
                toast({
                    title: "Error",
                    description: "Failed to load stock alerts.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStockData();
    }, [toast]);
    
    const totalValueLowStock = lowStockProducts.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const totalValueOutOfStock = outOfStockProducts.reduce((acc, p) => acc + (p.price * p.reOrderLevel), 0); // Estimated loss based on reorder level

    const kpis = [
        { title: "Low Stock Items", value: lowStockProducts.length, icon: AlertTriangle, color: 'yellow' as const },
        { title: "Out of Stock Items", value: outOfStockProducts.length, icon: Package, color: 'red' as const },
        { title: "Low Stock Value", value: `₱${totalValueLowStock.toLocaleString()}`, icon: AlertTriangle, color: 'orange' as const },
        { title: "Potential Lost Revenue", value: `₱${totalValueOutOfStock.toLocaleString()}`, icon: Package, color: 'purple' as const },
    ]

    return (
        <div className="flex flex-col gap-4">
            <PageHeader
                title="Stock Alerts"
                description="Manage items that are running low or are out of stock."
                icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
                actions={
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                }
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Low Stock Items ({lowStockProducts.length})</CardTitle>
                    <CardDescription>
                        These products have fallen below their specified re-order level and should be restocked soon.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StockAlertsTable products={lowStockProducts} />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Out of Stock Items ({outOfStockProducts.length})</CardTitle>
                    <CardDescription>
                        These products are completely out of stock.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <StockAlertsTable products={outOfStockProducts} isOutOfStock />
                </CardContent>
            </Card>

        </div>
    );
}


function StockAlertsTable({ products, isOutOfStock = false }: { products: Product[], isOutOfStock?: boolean }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Re-Order Level</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((product) => (
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
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className={`text-right font-bold ${isOutOfStock ? 'text-red-600' : 'text-yellow-600'}`}>
                            {product.stock}
                        </TableCell>
                        <TableCell className="text-right">{product.reOrderLevel}</TableCell>
                        <TableCell className="text-center">
                            <Button size="sm">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Create PO
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
                {products.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                            No {isOutOfStock ? 'out of stock' : 'low stock'} items.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
