
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
        preparedByLabel: 'Prepared by:',
        preparedByName: 'Admin',
        receivedByLabel: 'Received by:',
        receivedByName: '_________________________',
        verifiedByLabel: 'Verified by:',
        verifiedByName: '_________________________',
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

    const { companyName, address, phone, website, logo } = templateSettings;

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return format(date.toDate ? date.toDate() : new Date(date), 'PP');
    };

    return (
        <div className="py-4">
            <div className="flex flex-col items-center text-center mb-6">
                <Image src={logo} alt="Company Logo" width={80} height={80} className="mb-4" data-ai-hint="company logo" />
                <h2 className="text-xl font-bold">{companyName}</h2>
                <p className="text-sm text-muted-foreground">{address}</p>
                <p className="text-sm text-muted-foreground">{phone}</p>
                <p className="text-sm text-muted-foreground">{website}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-4">
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><User className="h-4 w-4 text-blue-500" /> Customer</h4>
                    <p className="text-muted-foreground text-sm pl-6">{jobOrder.customerName}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-green-500" /> Job Order Date</h4>
                    <p className="text-muted-foreground text-sm pl-6">{formatDate(jobOrder.jobOrderDate)}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-red-500" /> Expected Completion</h4>
                    <p className="text-muted-foreground text-sm pl-6">{formatDate(jobOrder.expectedCompletionDate)}</p>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-purple-500" /> SO Delivery Date</h4>
                    <p className="text-muted-foreground text-sm pl-6">{salesOrder ? formatDate(salesOrder.deliveryDate) : 'N/A'}</p>
                </div>
            </div>
            <Separator />
            <div className="space-y-2 py-2">
                <h4 className="font-semibold">Line Items</h4>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead style={{ backgroundColor: '#578C00', color: '#FFFFFF' }}>Product</TableHead>
                                <TableHead className="text-right" style={{ backgroundColor: '#578C00', color: '#FFFFFF' }}>Qty</TableHead>
                                <TableHead className="text-right" style={{ backgroundColor: '#578C00', color: '#FFFFFF' }}>UOM</TableHead>
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

            <div className="flex justify-between mt-24 text-center">
                <div>
                    <p className="font-bold border-b border-black pb-1 mb-1">Quotations</p>
                    <p className="text-sm">Verified by:</p>
                </div>
                 <div>
                    <p className="font-bold border-b border-black pb-1 mb-1">Inspections</p>
                    <p className="text-sm">Quality Check:</p>
                </div>
                 <div>
                    <p className="font-bold border-b border-black pb-1 mb-1">Sales Invoice</p>
                    <p className="text-sm">Admin Approval:</p>
                </div>
            </div>
        </div>
    );
}
