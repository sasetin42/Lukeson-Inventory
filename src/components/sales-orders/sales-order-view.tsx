
'use client';

import { useMemo } from 'react';
import { SalesOrder, VatType } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';

interface SalesOrderViewProps {
  salesOrder: SalesOrder;
}

const DEFAULT_TAX_RATE = 0.12;

export default function SalesOrderView({ salesOrder }: SalesOrderViewProps) {
    const accentColor = '#0A3BAA'; // This would be loaded from settings in a real app
    const companyName = 'YAMASHITA MOLD PHILIPPINES CORPORATION';
    const address = 'Lot 8, Block 1, Daichi Industrail Park-SEZ, Brgy. Maguyam, Silang, Cavite Philippines';
    const phone = 'Phone: (046) 972-1848; 430-0057; 430-0058; (02) 886-4463';
    const website = 'www.yamashitamold.ph';

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

    return (
        <div className="p-8 bg-white text-black">
            <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <Image src="https://placehold.co/100x50.png" width={100} height={50} alt="Company Logo" data-ai-hint="logo"/>
                    <div className="text-xs">
                        <p className="font-bold text-lg" style={{ color: accentColor }}>{companyName}</p>
                        <p>{address}</p>
                        <p>{phone}</p>
                        <p>{website}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold" style={{ color: accentColor }}>SALES ORDER</h2>
                    <p className="text-sm"><strong>Invoice ID:</strong> {salesOrder.id}</p>
                    <p className="text-sm"><strong>Date:</strong> {formatDate(salesOrder.orderDate)}</p>
                </div>
            </div>

            <div className="mt-8">
                <p className="font-bold">BILL TO:</p>
                <p>{salesOrder.customerName}</p>
                {/* Add customer address if available in the future */}
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
                    <div className="flex justify-between"><span>Vatable Sales:</span> <span>₱{totals.vatableSales.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>VAT-Exempt Sales:</span> <span>₱{totals.vatExemptSales.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Zero-Rated Sales:</span> <span>₱{totals.zeroRatedSales.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold"><span>Total Sales:</span> <span>₱{totals.totalSales.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Discount:</span> <span>- ₱{totals.discountAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Subtotal:</span> <span>₱{(totals.totalSales - totals.discountAmount).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>VAT (12%):</span> <span>₱{totals.vatAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t-2" style={{borderColor: accentColor}}>
                        <span>Total:</span>
                        <span>₱{salesOrder.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

             {salesOrder.notes && (
                <div className="mt-8">
                    <h4 className="font-bold">Notes:</h4>
                    <p className="text-sm text-muted-foreground">{salesOrder.notes}</p>
                </div>
            )}

            <div className="flex justify-between mt-24 text-center text-xs">
                <div>
                    <p className="font-bold">YMP / MCB / MJTS</p>
                    <p className="border-t border-black pt-1 mt-1">Prepared by:</p>
                </div>
                 <div>
                    <p className="font-bold">JUAN DELA CRUZ</p>
                    <p className="border-t border-black pt-1 mt-1">Received by:</p>
                </div>
                 <div>
                    <p className="font-bold">HIROYOSHI KANAZAWA - VP</p>
                    <p className="border-t border-black pt-1 mt-1">Verified by:</p>
                </div>
            </div>
        </div>
    );
}
