
'use client';

import { JobOrder, Quotation, SalesOrder } from '@/lib/types';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Calendar } from 'lucide-react';
import Image from 'next/image';

interface JobOrderViewProps {
  jobOrder: JobOrder;
  salesOrder?: SalesOrder;
  quotation?: Quotation;
}

export default function JobOrderView({ jobOrder, salesOrder, quotation }: JobOrderViewProps) {
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return format(date.toDate ? date.toDate() : new Date(date), 'PP');
    };

    return (
        <div className="py-4">
            <div className="flex flex-col items-center text-center mb-6">
                <Image src="https://firebasestorage.googleapis.com/v0/b/lukeson-inventory.appspot.com/o/e903a953-ab33-4f9e-953e-5390916e6373.png?alt=media" alt="Lukeson Lighting Company Logo" width={80} height={80} className="mb-4" data-ai-hint="company logo" />
                <h2 className="text-xl font-bold">LUKESON LIGHTING COMPANY</h2>
                <p className="text-sm text-muted-foreground">20 Genoveva, Novaliches, Quezon City, Metro Manila</p>
                <p className="text-sm text-muted-foreground">Phone: +63 912 378 5841</p>
                <p className="text-sm text-muted-foreground">https://lukesonlighting.com.ph/</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-4">
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><User className="h-4 w-4 text-blue-500" /> Customer</h4>
                    <p className="text-muted-foreground pl-6">{jobOrder.customerName}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-green-500" /> Job Order Date</h4>
                    <p className="text-muted-foreground pl-6">{formatDate(jobOrder.jobOrderDate)}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-red-500" /> Expected Completion</h4>
                    <p className="text-muted-foreground pl-6">{formatDate(jobOrder.expectedCompletionDate)}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-purple-500" /> SO Delivery Date</h4>
                    <p className="text-muted-foreground pl-6">{salesOrder ? formatDate(salesOrder.deliveryDate) : 'N/A'}</p>
                </div>
            </div>
            <Separator />
            <div className="space-y-2 py-2">
                <h4 className="font-semibold">Line Items</h4>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">UOM</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobOrder.lines.map((line, index) => (
                                <TableRow key={index}>
                                    <TableCell>{line.description}</TableCell>
                                    <TableCell className="text-right">{line.quantity}</TableCell>
                                    <TableCell className="text-right">{line.uom}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                 <div className="space-y-2">
                    <h4 className="font-semibold">Quotation Notes</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md min-h-[80px]">
                        {quotation?.notes || 'No quotation notes available.'}
                    </p>
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold">Sales Order Notes</h4>
                     <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md min-h-[80px]">
                        {salesOrder?.notes || 'No sales order notes available.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
