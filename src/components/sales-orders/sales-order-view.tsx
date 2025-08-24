
'use client';

import { useMemo, useState, useEffect } from 'react';
import { SalesOrder, VatType } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Badge } from '../ui/badge';

interface SalesOrderViewProps {
  salesOrder: SalesOrder;
}

const TEMPLATE_DOC_ID = 'salesOrder';

export default function SalesOrderView({ salesOrder }: SalesOrderViewProps) {
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

    const { accentColor, companyName, address, phone, website, logo, showNotes, showVat, preparedByLabel, preparedByName, receivedByLabel, receivedByName, verifiedByLabel, verifiedByName } = templateSettings;

    const totals = useMemo(() => {
        const totalSales = salesOrder.lines.reduce((acc, l) => acc + l.total, 0);

        let vatableSales = 0;
        let vatExemptSales = 0;
        let zeroRatedSales = 0;

        const discountAmount = salesOrder.discountType === 'Fixed' 
            ? Math.min(salesOrder.discountValue || 0, totalSales)
            : totalSales * (Math.min(salesOrder.discountValue || 0, 100) / 100);

        const totalAfterDiscount = totalSales - discountAmount;
        let vatAmount = 0;

        if(totalSales > 0) {
            salesOrder.lines.forEach(line => {
                const proportion = line.total / totalSales;
                const lineDiscount = discountAmount * proportion;
                const discountedTotal = line.total - lineDiscount;

                if (line.vatType === 'VATable') {
                    const baseAmount = discountedTotal / (1 + line.taxRate)
                    vatableSales += baseAmount;
                    vatAmount += baseAmount * line.taxRate;
                } else if (line.vatType === 'VAT-Exempt') {
                    vatExemptSales += discountedTotal;
                } else if (line.vatType === 'Zero-Rated') {
                    zeroRatedSales += discountedTotal;
                }
            });
        }
        
        const totalAmount = totalAfterDiscount;
        
        return {
            vatableSales,
            vatExemptSales,
            zeroRatedSales,
            totalSales,
            discountAmount,
            vatAmount: vatAmount < 0 ? 0 : vatAmount,
            totalAmount: totalAmount < 0 ? 0 : totalAmount,
        }
    }, [salesOrder.lines, salesOrder.discountType, salesOrder.discountValue]);

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return format(date.toDate ? date.toDate() : new Date(date), 'PP');
    };

    const getStatusVariant = (status: SalesOrder['status']): "default" | "secondary" | "destructive" | "outline" | "success" | "confirmed" => {
        switch (status) {
            case 'Fulfilled':
                return 'success';
            case 'Confirmed':
                return 'confirmed';
            case 'Draft':
                return 'outline';
            case 'Cancelled':
                return 'destructive';
            case 'Invoiced':
                 return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <div className="p-8 bg-white text-black">
            <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <Image src={logo} width={100} height={50} alt="Company Logo" data-ai-hint="logo"/>
                    <div style={{ fontSize: '13px' }}>
                        <p className="font-bold" style={{ color: accentColor, fontSize: '20px', lineHeight: '25px' }}>{companyName}</p>
                        <p>{address}</p>
                        <p>{phone}</p>
                        <p>{website}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="font-bold" style={{ color: accentColor, fontSize: '20px', lineHeight: '25px' }}>SALES ORDER</h2>
                    <p style={{ fontSize: '13px' }}><strong>SO:</strong> {salesOrder.id}</p>
                    <p style={{ fontSize: '13px' }}><strong>Date:</strong> {formatDate(salesOrder.orderDate)}</p>
                    <p style={{ fontSize: '13px' }}><strong>Delivery Date:</strong> {formatDate(salesOrder.deliveryDate)}</p>
                    {salesOrder.quotationId && <p style={{ fontSize: '13px' }}><strong>Quotation ID:</strong> {salesOrder.quotationId}</p>}
                    <Badge variant={getStatusVariant(salesOrder.status)} className="mt-2 text-white">{salesOrder.status}</Badge>
                </div>
            </div>

            <div className="mt-8 text-sm flex">
                <div className="w-1/2">
                    <p className="font-bold">BILL TO:</p>
                    <p>{salesOrder.customerName}</p>
                    {salesOrder.customerTin && <p>TIN: {salesOrder.customerTin}</p>}
                    {salesOrder.customerEmail && <p>Email: {salesOrder.customerEmail}</p>}
                    {salesOrder.customerPhone && <p>Phone: {salesOrder.customerPhone}</p>}
                </div>
                <div className="w-1/2">
                    <p className="font-bold">SHIPPING ADDRESS:</p>
                    {salesOrder.customerShippingAddress ? (
                        <p>{salesOrder.customerShippingAddress}</p>
                    ) : (
                        <p>Same as billing address.</p>
                    )}
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
                    {salesOrder.lines.map((line, index) => (
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
                    {showVat && (
                        <>
                            <div className="flex justify-between"><span>Vatable Sales:</span> <span>₱{totals.vatableSales.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>VAT-Exempt Sales:</span> <span>₱{totals.vatExemptSales.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Zero-Rated Sales:</span> <span>₱{totals.zeroRatedSales.toFixed(2)}</span></div>
                        </>
                    )}
                    <div className="flex justify-between font-bold"><span>Total Sales:</span> <span>₱{totals.totalSales.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Discount:</span> <span>- ₱{totals.discountAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Subtotal:</span> <span>₱{(totals.totalSales - totals.discountAmount).toFixed(2)}</span></div>
                    {showVat && <div className="flex justify-between"><span>VAT (12%):</span> <span>₱{totals.vatAmount.toFixed(2)}</span></div>}
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t-2" style={{borderColor: accentColor}}>
                        <span>Total:</span>
                        <span>₱{salesOrder.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {showNotes && (
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div>
                  <h4 className="font-bold">Quotation Notes:</h4>
                  <p className="text-sm text-muted-foreground">{salesOrder.notes || "No quotation notes."}</p>
                </div>
                <div>
                  <h4 className="font-bold">Sales Order Notes:</h4>
                  <p className="text-sm text-muted-foreground">{salesOrder.notes || "No sales order notes."}</p>
                </div>
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
