
'use client';

import { PurchaseOrder } from '@/lib/types';
import { format } from 'date-fns';
import Image from 'next/image';

interface PurchaseOrderViewProps {
  purchaseOrder: PurchaseOrder;
}

export default function PurchaseOrderView({ purchaseOrder }: PurchaseOrderViewProps) {
    const accentColor = '#0A3BAA';
    const companyName = 'YAMASHITA MOLD PHILIPPINES CORPORATION';
    const address = 'Lot 8, Block 1, Daichi Industrail Park-SEZ, Brgy. Maguyam, Silang, Cavite Philippines';
    const phone = 'Phone: (046) 972-1848; 430-0057; 430-0058; (02) 886-4463';
    const website = 'www.yamashitamold.ph';

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        return format(date.toDate ? date.toDate() : new Date(date), 'PP');
    };

    return (
        <div className="p-8 bg-white text-black">
            <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    <Image src="https://placehold.co/100x50.png" width={100} height={50} alt="Company Logo" data-ai-hint="logo" />
                    <div className="text-xs">
                        <p className="font-bold text-lg" style={{ color: accentColor }}>{companyName}</p>
                        <p>{address}</p>
                        <p>{phone}</p>
                        <p>{website}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-3xl font-bold" style={{ color: accentColor }}>PURCHASE ORDER</h2>
                    <p className="text-sm"><strong>PO ID:</strong> {purchaseOrder.id}</p>
                    <p className="text-sm"><strong>Date:</strong> {formatDate(purchaseOrder.orderDate)}</p>
                    <p className="text-sm"><strong>Expected Delivery:</strong> {formatDate(purchaseOrder.expectedDeliveryDate)}</p>
                </div>
            </div>

            <div className="mt-8">
                <p className="font-bold">VENDOR:</p>
                <p>{purchaseOrder.supplierName}</p>
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
                    {purchaseOrder.lines.map((line, index) => (
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
                        <span>Total:</span>
                        <span>₱{purchaseOrder.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

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
