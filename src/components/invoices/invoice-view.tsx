'use client';

import { Invoice, SalesOrder } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Separator } from '../ui/separator';

interface InvoiceViewProps {
  invoice: Invoice;
}

const TEMPLATE_DOC_ID = 'invoice';

export default function InvoiceView({ invoice }: InvoiceViewProps) {
    const [templateSettings, setTemplateSettings] = useState({
        accentColor: '#0A3BAA',
        companyName: 'YAMASHITA MOLD PHILIPPINES CORPORATION',
        tin: '',
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
    const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
    
    useEffect(() => {
        const fetchSettingsAndData = async () => {
            try {
                // Fetch template settings
                const templateRef = doc(db, 'templates', TEMPLATE_DOC_ID);
                const templateSnap = await getDoc(templateRef);
                if (templateSnap.exists()) {
                    setTemplateSettings(templateSnap.data() as typeof templateSettings);
                }

                // Fetch linked sales order to get quotation ID
                if(invoice.salesOrderId) {
                    const soRef = doc(db, 'salesOrders', invoice.salesOrderId);
                    const soSnap = await getDoc(soRef);
                    if(soSnap.exists()) {
                        setSalesOrder(soSnap.data() as SalesOrder);
                    }
                }
            } catch (error) {
                console.error("Error fetching related data for view:", error);
            }
        };
        fetchSettingsAndData();
    }, [invoice.salesOrderId]);

    const { accentColor, companyName, tin, address, phone, website, logo, showDueDate, showNotes, showVat, preparedByLabel, preparedByName, receivedByLabel, receivedByName, verifiedByLabel, verifiedByName } = templateSettings;

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return format(date.toDate ? date.toDate() : new Date(date), 'PP');
    };
    
    const totalSales = invoice.lines.reduce((acc, line) => acc + line.total, 0);

    return (
        <div className="p-8 bg-white text-black">
            <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <Image src={logo} width={100} height={50} alt="Company Logo" data-ai-hint="logo" />
                    <div className="text-xs">
                        <p className="font-bold text-lg" style={{ color: accentColor }}>{companyName}</p>
                        {tin && <p><strong>TIN: {tin}</strong></p>}
                        <p>{address}</p>
                        <p>{phone}</p>
                        <p>{website}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="font-bold" style={{ color: accentColor, fontSize: '25px' }}>INVOICE</h2>
                    <p style={{ fontSize: '12px' }}><strong>Invoice ID:</strong> {invoice.id}</p>
                    <p style={{ fontSize: '12px' }}><strong>Date:</strong> {formatDate(invoice.date)}</p>
                    {showDueDate && <p style={{ fontSize: '12px' }}><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>}
                    {salesOrder?.quotationId && <p style={{ fontSize: '12px' }}><strong>QTN:</strong> {salesOrder.quotationId}</p>}
                    {invoice.salesOrderId && <p style={{ fontSize: '12px' }}><strong>SO:</strong> {invoice.salesOrderId}</p>}
                </div>
            </div>

            <div className="mt-8 text-sm flex justify-between">
                <div className="w-1/2">
                    <p className="font-bold">BILL TO:</p>
                    <p>{invoice.customerName}</p>
                    {invoice.customerTin && <p><strong>TIN: {invoice.customerTin}</strong></p>}
                    {invoice.customerEmail && <p>Email: {invoice.customerEmail}</p>}
                    {invoice.customerPhone && <p>Phone: {invoice.customerPhone}</p>}
                </div>
                <div className="w-1/2">
                    <p className="font-bold">SHIPPING ADDRESS:</p>
                    <p>{salesOrder?.customerShippingAddress || 'Same as billing address.'}</p>
                </div>
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
            
            <div className="flex justify-between mt-4">
                <div className="w-1/2">
                    {showNotes && (
                        <div>
                            <h4 className="font-bold">Notes:</h4>
                            <p className="text-sm text-muted-foreground">{invoice.notes || 'No notes for this invoice.'}</p>
                        </div>
                    )}
                </div>
                <div className="w-1/2 text-sm space-y-1">
                    {showVat && (
                        <>
                            <div className="flex justify-between"><span>Vatable Sales:</span> <span>₱{(invoice.vatableSales || 0).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>VAT-Exempt Sales:</span> <span>₱{(invoice.vatExemptSales || 0).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Zero-Rated Sales:</span> <span>₱{(invoice.zeroRatedSales || 0).toFixed(2)}</span></div>
                            <Separator className="my-1"/>
                        </>
                    )}
                    <div className="flex justify-between font-bold"><span>Total Sales:</span> <span>₱{totalSales.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Discount:</span> <span>- ₱{(invoice.discountValue || 0).toFixed(2)}</span></div>
                     <div className="flex justify-between"><span>Subtotal:</span> <span>₱{(totalSales - (invoice.discountValue || 0)).toFixed(2)}</span></div>
                    {showVat && <div className="flex justify-between"><span>VAT (12%):</span> <span>₱{(invoice.vatAmount || 0).toFixed(2)}</span></div>}
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t-2" style={{borderColor: accentColor}}>
                        <span>Total Amount Due:</span>
                        <span>₱{invoice.amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

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
