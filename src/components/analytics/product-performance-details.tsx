
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sales, Product } from '@/lib/types';
import { TrendingUpIcon } from '../icons/trending-up';

interface ProductPerformanceDetailsProps {
    dateRange: number;
    products: Product[];
    sales: Sales[];
}

export default function ProductPerformanceDetails({ dateRange, products, sales }: ProductPerformanceDetailsProps) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dateRange);

    const filteredSales = sales.filter(s => new Date(s.date) >= cutoffDate);
    
    const productPerformanceData = products.map(product => {
        const productSales = filteredSales.filter(s => s.productId === product.id);
        if (productSales.length === 0) return null;

        const unitsSold = productSales.reduce((acc, s) => acc + s.quantity, 0);
        const revenue = productSales.reduce((acc, s) => acc + s.total, 0);
        const avgPrice = unitsSold > 0 ? revenue / unitsSold : 0;

        return {
            id: product.id,
            name: product.name,
            unitsSold,
            revenue,
            avgPrice,
            trend: Math.floor(Math.random() * 15) + 5, // Mock trend
        };
    }).filter(p => p !== null && p.unitsSold > 0).sort((a,b) => b!.revenue - a!.revenue).slice(0, 5);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Units Sold</TableHead>
                            <TableHead className="text-right">Revenue</TableHead>
                            <TableHead className="text-right">Avg Price</TableHead>
                            <TableHead className="text-right">Trend</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productPerformanceData.map((product) => (
                            <TableRow key={product!.id}>
                                <TableCell className="font-medium">{product!.name}</TableCell>
                                <TableCell className="text-right">{product!.unitsSold.toLocaleString()}</TableCell>
                                <TableCell className="text-right">₱{product!.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                <TableCell className="text-right">₱{product!.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className="flex items-center gap-1 border-green-500/50 bg-green-50 text-green-700">
                                        <TrendingUpIcon className="h-4 w-4" />
                                        +{product!.trend}%
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
