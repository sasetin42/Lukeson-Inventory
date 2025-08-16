
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { suppliers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Star } from 'lucide-react';

interface SupplierPerformanceListProps {
    dateRange: number;
}

export default function SupplierPerformanceList({ dateRange }: SupplierPerformanceListProps) {
    // Mock performance data that changes with date range
    const supplierPerformance = suppliers.map(s => ({
        ...s,
        orderCount: Math.floor((Math.random() * 20 + 5) * (dateRange/30)),
        onTimeRate: Math.floor(Math.random() * 11) + 90, // 90% - 100%
        qualityRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(2)), // 3.5 - 5.0
        performance: ['Excellent', 'Good', 'Average'][Math.floor(Math.random() * 3)]
    }));

    const getPerformanceBadgeVariant = (performance: string) => {
        if (performance === 'Excellent') return 'default';
        if (performance === 'Good') return 'secondary';
        return 'destructive';
    }

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return (
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                {halfStar && <Star key="half" className="h-4 w-4 text-yellow-400 fill-yellow-200" />}
                {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)}
                <span className="ml-2 text-xs text-muted-foreground">({rating.toFixed(1)})</span>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Supplier Performance Overview</CardTitle>
                <CardDescription>Key performance indicators for your suppliers.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="text-center">Total Orders</TableHead>
                            <TableHead className="text-center">On-Time Delivery</TableHead>
                            <TableHead>Quality Rating</TableHead>
                            <TableHead className="text-center">Performance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {supplierPerformance.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="hidden h-9 w-9 sm:flex">
                                            <AvatarImage src={`https://placehold.co/40x40.png`} alt={supplier.name} data-ai-hint="company logo" />
                                            <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{supplier.name}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">{supplier.orderCount}</TableCell>
                                <TableCell className="text-center">
                                    <div className='flex items-center justify-center'>
                                        <span className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></span>
                                        {supplier.onTimeRate}%
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {renderStars(supplier.qualityRating)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={getPerformanceBadgeVariant(supplier.performance)}>{supplier.performance}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
