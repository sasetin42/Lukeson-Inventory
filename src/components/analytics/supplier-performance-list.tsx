
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { suppliers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// Mock performance data
const supplierPerformance = suppliers.map(s => ({
    ...s,
    orderCount: Math.floor(Math.random() * 20) + 5,
    totalSpent: (Math.random() * 50000) + 10000,
    avgLeadTime: Math.floor(Math.random() * 10) + 5,
    onTimeRate: Math.floor(Math.random() * 15) + 85,
}));


export default function SupplierPerformanceList() {
    const getLeadTimeBadgeVariant = (time: number) => {
        if (time <= 7) return 'default';
        if (time <= 10) return 'secondary';
        return 'destructive';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Supplier Performance</CardTitle>
                <CardDescription>Key performance indicators for your suppliers.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="text-center">Orders</TableHead>
                            <TableHead className="text-right">Total Spent</TableHead>
                            <TableHead className="text-center">Avg. Lead Time (Days)</TableHead>
                            <TableHead className="text-center">On-Time Rate</TableHead>
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
                                <TableCell className="text-right">₱{supplier.totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={getLeadTimeBadgeVariant(supplier.avgLeadTime)}>{supplier.avgLeadTime}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={supplier.onTimeRate >= 95 ? 'default' : 'secondary'}>{supplier.onTimeRate}%</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
