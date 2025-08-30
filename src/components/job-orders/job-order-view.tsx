
'use client';

import { JobOrder, Quotation, SalesOrder } from '@/lib/types';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Badge } from '../ui/badge';

interface JobOrderViewProps {
  jobOrder: JobOrder;
  salesOrder?: SalesOrder;
  quotation?: Quotation;
}

const TEMPLATE_DOC_ID = 'jobOrder';

export default function JobOrderView({ jobOrder, salesOrder, quotation }: JobOrderViewProps) {
    const [templateSettings, setTemplateSettings] = useState({
        accentColor: '#F97316',
        companyName: 'LUKESON LIGHTING COMPANY',
        address: '20 Genoveva, Novaliches, Quezon City, Metro Manila',
        phone: 'Phone: +63 912 378 5841',
        website: 'https://lukesonlighting.com.ph/',
        logo: 'https://firebasestorage.googleapis.com/v0/b/lukeson-inventory.appspot.com/o/e903a953-ab33-4f9e-953e-5390916e6373.png?alt=media',
        showDueDate: true,
        showNotes: true,
        showVat: true,
        preparedBy: 'Admin\nPrepared by',
        verifiedBy: '_________________________\nCustomer signature over printed name',
    });
    
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const templateRef = doc(db, 'templates', TEMPLATE_DOC_ID);
                const docSnap = await getDoc(templateRef);
                if (docSnap.exists()) {
                    setTemplateSettings(docSnap.data() as typeof templateSettings);
                }
            } catch (error) {
                console.error("Error fetching template settings for view:", error);
            }
        };
        fetchSettings();
    }, []);

    const { companyName, address, phone, website, logo, preparedBy, verifiedBy } = templateSettings;

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return format(date.toDate ? date.toDate() : new Date(date), 'PP');
    };
    
    const getStatusVariant = (status: JobOrder['status']): "completed" | "secondary" | "destructive" | "outline" | "inProgress" | "draft" => {
        switch (status) {
            case 'Completed': return 'completed';
            case 'In Progress': return 'inProgress';
            case 'Scheduled': return 'secondary';
            case 'Draft': return 'draft';
            case 'On Hold': return 'outline';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    };
    
    const getQuotationStatusVariant = (status?: Quotation['status']): "default" | "secondary" | "destructive" | "outline" | "success" => {
        if (!status) return 'outline';
        switch (status) {
            case 'Accepted': return 'success';
            case 'Sent': return 'secondary';
            case 'Draft': return 'outline';
            case 'Expired': return 'destructive';
            default: return 'outline';
        }
    };

    const getSalesOrderStatusVariant = (status?: SalesOrder['status']): "fulfilled" | "secondary" | "destructive" | "outline" | "success" | "confirmed" => {
        if (!status) return 'outline';
        switch (status) {
            case 'Fulfilled': return 'fulfilled';
            case 'Confirmed': return 'confirmed';
            case 'Draft': return 'outline';
            case 'Cancelled': return 'destructive';
            case 'Invoiced': return 'destructive';
            default: return 'outline';
        }
    };
    
    const renderSignature = (text: string) => {
        const [name, ...labelParts] = text.split('\n');
        const label = labelParts.join('\n');
        return (
            <div>
                <p className="font-bold">{name}</p>
                <p className="text-xs border-t border-black pt-1 mt-1">{label}</p>
            </div>
        )
    }

    return (
        <div className="py-4 text-xs">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <Image src={logo} alt="Company Logo" width={60} height={60} className="mb-2" data-ai-hint="logo" />
                    <div>
                        <h2 className="text-lg font-bold">{companyName}</h2>
                        <p className="text-xs text-muted-foreground">{address}</p>
                        <p className="text-xs text-muted-foreground">{phone}</p>
                        <p className="text-xs text-muted-foreground">{website}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-xl font-bold" style={{ color: templateSettings.accentColor }}>JOB ORDER</h3>
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-muted-foreground">{jobOrder.id}</span>
                        <Badge variant={getStatusVariant(jobOrder.status)} className="capitalize h-fit">{jobOrder.status}</Badge>
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-end gap-2">
                            <h4 className="font-semibold text-xs">Quotation Status:</h4>
                            {quotation ? <Badge variant={getQuotationStatusVariant(quotation.status)}>{quotation.status}</Badge> : <Badge variant="outline">N/A</Badge>}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <h4 className="font-semibold text-xs">Sales Order Status:</h4>
                            {salesOrder ? <Badge variant={getSalesOrderStatusVariant(salesOrder.status)}>{salesOrder.status}</Badge> : <Badge variant="outline">N/A</Badge>}
                        </div>
                    </div>
                </div>
            </div>
            
            <Separator />

             <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-3 text-xs">
                <div>
                    <h4 className="font-semibold mb-1">BILL TO:</h4>
                    <p className="text-muted-foreground">{salesOrder?.customerName || jobOrder.customerName}</p>
                    <p className="text-muted-foreground">{salesOrder?.customerTin ? `TIN: ${salesOrder.customerTin}` : ''}</p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1">SHIPPING ADDRESS:</h4>
                    <p className="text-muted-foreground">{salesOrder?.customerShippingAddress || 'N/A'}</p>
                </div>
            </div>


            <div className="grid grid-cols-4 gap-x-4 gap-y-2 py-3 text-xs">
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-1"><User className="h-3 w-3" /> Customer</h4>
                    <p className="text-muted-foreground pl-4">{jobOrder.customerName}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> Job Order Date</h4>
                    <p className="text-muted-foreground pl-4">{formatDate(jobOrder.jobOrderDate)}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> Expected Completion</h4>
                    <p className="text-muted-foreground pl-4">{formatDate(jobOrder.expectedCompletionDate)}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> SO Delivery Date</h4>
                    <p className="text-muted-foreground pl-4">{salesOrder ? formatDate(salesOrder.deliveryDate) : 'N/A'}</p>
                </div>
            </div>
            <Separator />
            <div className="space-y-1 py-2">
                <h4 className="font-semibold text-sm">Line Items</h4>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead style={{ backgroundColor: '#578C00', color: '#FFFFFF' }} className="py-2 px-3 text-sm h-auto">Product</TableHead>
                                <TableHead className="text-right py-2 px-3 text-sm h-auto" style={{ backgroundColor: '#578C00', color: '#FFFFFF' }}>Qty</TableHead>
                                <TableHead className="text-right py-2 px-3 text-sm h-auto" style={{ backgroundColor: '#578C00', color: '#FFFFFF' }}>UOM</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobOrder.lines.map((line, index) => (
                                <TableRow key={index}>
                                    <TableCell className="py-2 px-3 text-sm">{line.description}</TableCell>
                                    <TableCell className="text-right py-2 px-3 text-sm">{line.quantity}</TableCell>
                                    <TableCell className="text-right py-2 px-3 text-sm">{line.uom}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            
            <Separator />
            <div className="grid grid-cols-2 gap-4 py-3 text-xs">
                 <div className="space-y-1">
                    <h4 className="font-semibold">Quotation Notes</h4>
                    <p className="text-muted-foreground p-2 bg-muted/50 rounded-md min-h-[60px]">
                        {quotation?.notes || 'No quotation notes available.'}
                    </p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold">Sales Order Notes</h4>
                     <p className="text-muted-foreground p-2 bg-muted/50 rounded-md min-h-[60px]">
                        {salesOrder?.notes || 'No sales order notes available.'}
                    </p>
                </div>
            </div>

            <div className="flex justify-between mt-16 text-center text-xs">
                {renderSignature(preparedBy)}
                {renderSignature(verifiedBy)}
            </div>
        </div>
    );
}
