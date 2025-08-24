
'use client';

import { Invoice } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '../ui/separator';

interface InvoiceViewProps {
  invoice: Invoice;
}

const TEMPLATE_DOC_ID = 'invoice';

export default function InvoiceView({ invoice }: InvoiceViewProps) {
    const [templateSettings, setTemplateSettings] = useState({
        accentColor: '#0A3BAA',
        companyName: 'YAMASHITA MOLD PHILIPPINES CORPORATION',
        address: 'Lot 8, Block 1, Daichi Industrail Park-SEZ, Brgy. Maguyam, Silang, Cavite Philippines',
        phone: 'Phone: (046) 972-1848; 430-0057; 430-0058; (02) 886-4463',
        website: 'www.yamashitamold.ph',
        logo: 'https://placehold.co/100x50.png',
        showDueDate: true,
        showNotes: true,
        showVat: true,
        preparedByLabel: 'Prepared by:',
        preparedByName: 'YMP / MCB / MJTS',
        receivedByLabel: 'Received by:',
        receivedByName: 'JUAN DELA CRUZ',
        verifiedByLabel: 'Verified by:',
        verifiedByName: 'HIROYOSHI KANAZAWA - VP',
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

    const { accentColor, companyName, address, phone, website, logo, showDueDate, showNotes, showVat, preparedByLabel, preparedByName, receivedByLabel, receivedByName, verifiedByLabel, verifiedByName } = templateSettings;

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return format(date.toDate ? date.toDate() : new Date(date), 'PP');
    };

    return (
        <div className="p-8 bg-white text-black">
            <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <Image src={logo} width={100} height={50} alt="Company Logo" data-ai-hint="logo" />
                    <div className="text-xs">
                        <p className="font-bold text-lg" style={{ color: accentColor }}>{companyName}</p>
                        <p>{address}</p>
                        <p>{phone}</p>
                        <p>{website}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold" style={{ color: accentColor }}>INVOICE</h2>
                    <p className="text-sm"><strong>Invoice ID:</strong> {invoice.id}</p>
                    <p className="text-sm"><strong>Date:</strong> {formatDate(invoice.date)}</p>
                    {showDueDate && <p className="text-sm"><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>}
                </div>
            </div>

            <div className="mt-8">
                <p className="font-bold">BILL TO:</p>
                <p>{invoice.customerName}</p>
            </div>
            
            <table className="w-full mt-4 border-collapse text-sm">
                <thead>
                    <tr>
                        <th className="p-2 text-left text-white" style={{backgroundColor: accentColor}}>Description</th>
                        <th className="p-2 text-right text-white" style={{backgroundColor: accentColor}}>Qty</th>
                        <th className="p-2 text-right text-white" style={{backgroundColor: accentColor}}>Unit Price</th>
                        <th className="p-2 text-right text-white" style={{backgroundColor: accentColor}}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.lines.map((line, index) => (
                        <tr key={index} className="border-b">
                            <td className="p-2">{line.description}</td>
                            <td className="p-2 text-right">{line.quantity}</td>
                            <td className="p-2 text-right">₱{line.unitPrice.toFixed(2)}</td>
                            <td className="p-2 text-right">₱{line.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="flex justify-end mt-4">
                <div className="w-1/2 text-sm">
                     <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t-2" style={{borderColor: accentColor}}>
                        <span>Total Amount Due:</span>
                        <span>₱{invoice.amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {showNotes && (
                 <div className="mt-8">
                    <h4 className="font-bold">Notes:</h4>
                    <p className="text-sm text-muted-foreground">{invoice.notes || 'No notes for this invoice.'}</p>
                </div>
            )}

            <div className="flex justify-between mt-24 text-center text-xs">
                <div>
                    <p className="font-bold">{preparedByName}</p>
                    <p className="border-t border-black pt-1 mt-1">{preparedByLabel}</p>
                </div>
                 <div>
                    <p className="font-bold">{receivedByName}</p>
                    <p className="border-t border-black pt-1 mt-1">{receivedByLabel}</p>
                </div>
                 <div>
                    <p className="font-bold">{verifiedByName}</p>
                    <p className="border-t border-black pt-1 mt-1">{verifiedByLabel}</p>
                </div>
            </div>
        </div>
    );
}
