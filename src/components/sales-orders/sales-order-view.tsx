

'use client';

import { useMemo, useState, useEffect } from 'react';
import { SalesOrder, VatType, Quotation, Product } from '@/lib/types';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Badge } from '../ui/badge';
import ProductImage from '../products/product-image';

interface SalesOrderViewProps {
  salesOrder: SalesOrder;
  quotation?: Quotation;
  products: Product[];
}

const TEMPLATE_DOC_ID = 'salesOrder';

export default function SalesOrderView({ salesOrder, quotation, products }: SalesOrderViewProps) {
    const [templateSettings, setTemplateSettings] = useState({
        accentColor: '#0A3BAA',
        companyName: 'LUKESON LIGHTING AND ELECTRICAL SERVICES COMPANY',
        address: '20 Genoveva St. Brgy. Gulod Novaliches, 1114 Quezon City, Philippines.',
        phone: 'Phone: 09176018881 | 09178162341',
        website: 'https://www.lukesonlighting.com.ph',
        logo: 'https://placehold.co/100x50.png',
        showNotes: true,
        showVat: true,
        verifiedBy: 'HIROYOSHI KANAZAWA - VP\nCustomer signature over printed name',
    });
    
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const templateRef = doc(db, 'templates', TEMPLATE_DOC_ID);
                const docSnap = await getDoc(templateRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as typeof templateSettings;
                    const cName = data.companyName === 'YAMASHITA MOLD PHILIPPINES CORPORATION' || data.companyName === 'LUKESON COMPANY' || !data.companyName
                        ? 'LUKESON LIGHTING AND ELECTRICAL SERVICES COMPANY' 
                        : data.companyName;
                    const cAddr = data.address?.includes('Daichi') || data.address === '20 Genoveva, Novaliches, Quezon City, Metro Manila' || !data.address
                        ? '20 Genoveva St. Brgy. Gulod Novaliches, 1114 Quezon City, Philippines.' 
                        : data.address;
                    const cPhone = data.phone?.includes('972-1848') || data.phone?.includes('912 378 5841') || !data.phone
                        ? 'Phone: 09176018881 | 09178162341' 
                        : data.phone;
                    const cWeb = data.website?.includes('yamashitamold') || data.website === 'https://lukesonlighting.com.ph/' || !data.website
                        ? 'https://www.lukesonlighting.com.ph' 
                        : data.website;

                    setTemplateSettings({
                        ...data,
                        companyName: cName,
                        address: cAddr,
                        phone: cPhone,
                        website: cWeb,
                    });
                }
            } catch (error) {
                console.error("Error fetching template settings for view:", error);
            }
        };
        fetchSettings();
    }, []);

    const { accentColor, companyName, address, phone, website, logo, showNotes, showVat, verifiedBy } = templateSettings;

    const totals = useMemo(() => {
        const totalSales = salesOrder.lines.reduce((acc, l) => acc + l.total, 0);
        const discountableSales = salesOrder.lines.filter(l => l.isDiscountable !== false).reduce((acc, l) => acc + l.total, 0);

        let vatableSales = 0;
        let vatExemptSales = 0;
        let zeroRatedSales = 0;

        const discountAmount = salesOrder.discountType === 'Fixed' 
            ? Math.min(salesOrder.discountValue || 0, discountableSales)
            : discountableSales * (Math.min(salesOrder.discountValue || 0, 100) / 100);

        const totalAfterDiscount = totalSales - discountAmount;
        let vatAmount = 0;

        if(totalSales > 0) {
            salesOrder.lines.forEach(line => {
                const isLineDiscountable = line.isDiscountable !== false;
                let lineDiscount = 0;
                if (isLineDiscountable && discountableSales > 0) {
                    const proportion = line.total / discountableSales;
                    lineDiscount = discountAmount * proportion;
                }
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

    const getStatusVariant = (status: SalesOrder['status']): "fulfilled" | "secondary" | "destructive" | "outline" | "success" | "confirmed" | "draft" => {
        switch (status) {
            case 'Fulfilled':
                return 'fulfilled';
            case 'Confirmed':
                return 'confirmed';
            case 'Draft':
                return 'draft';
            case 'Cancelled':
                return 'destructive';
            case 'Invoiced':
                 return 'destructive';
            default:
                return 'outline';
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
    
    const renderSignature = (text: string) => {
        if (!text) return null;
        const [name, ...labelParts] = text.split('\n');
        const label = labelParts.join('\n');
        return (
            <div>
                <p className="font-bold">{name}</p>
                <p className="border-t border-black pt-1 mt-1">{label}</p>
            </div>
        )
    }

    return (
        <div className="p-6 bg-white text-black">
            <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                    <div>
                        <p className="font-bold text-[15px] leading-tight" style={{ color: accentColor }}>{companyName}</p>
                        <div className="text-[11px] leading-snug text-neutral-600 mt-0.5 space-y-0.5">
                            <p>{address}</p>
                            <p>{phone}</p>
                            <p>{website}</p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="font-bold text-[16px] leading-tight" style={{ color: accentColor }}>SALES ORDER</h2>
                    <div className="text-[11px] leading-snug text-neutral-700 mt-0.5 space-y-0.5">
                        <p><strong>SO:</strong> {salesOrder.id}</p>
                        <p>
                            <span><strong>Date:</strong> {formatDate(salesOrder.orderDate)}</span>
                            <span className="mx-1.5 text-neutral-400">|</span>
                            <span><strong>Delivery Date:</strong> {formatDate(salesOrder.deliveryDate)}</span>
                        </p>
                        {salesOrder.quotationId && <p><strong>Quotation ID:</strong> {salesOrder.quotationId}</p>}
                    </div>
                    <div className="flex justify-end items-center gap-1.5 mt-1.5">
                        {quotation && (
                            <>
                                <span className="text-[10px] font-semibold text-neutral-600">Quotation:</span>
                                <Badge variant={getQuotationStatusVariant(quotation.status)} className="text-[10px] py-0 px-1.5">{quotation.status}</Badge>
                                <span className="text-[10px] text-neutral-400">|</span>
                            </>
                        )}
                        <span className="text-[10px] font-semibold text-neutral-600">Sales Order:</span>
                        <Badge variant={getStatusVariant(salesOrder.status)} className="text-[10px] py-0 px-1.5">{salesOrder.status}</Badge>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-xs flex gap-6">
                <div className="w-1/2">
                    <p className="text-[11px] font-bold text-neutral-900 mb-0.5">BILL TO:</p>
                    <div className="text-[11px] leading-tight text-neutral-700 space-y-0.5">
                        <p className="font-medium text-neutral-900">{salesOrder.customerName}</p>
                        {salesOrder.customerTin && <p>TIN: {salesOrder.customerTin}</p>}
                        {salesOrder.customerEmail && <p>Email: {salesOrder.customerEmail}</p>}
                        {salesOrder.customerPhone && <p>Phone: {salesOrder.customerPhone}</p>}
                    </div>
                </div>
                <div className="w-1/2">
                    <p className="text-[11px] font-bold text-neutral-900 mb-0.5">SHIPPING ADDRESS:</p>
                    <div className="text-[11px] leading-tight text-neutral-700">
                        {salesOrder.customerShippingAddress ? (
                            <p>{salesOrder.customerShippingAddress}</p>
                        ) : (
                            <p className="text-neutral-500 italic">Same as billing address.</p>
                        )}
                    </div>
                </div>
            </div>
            
            <table className="w-full mt-3 border-collapse text-xs table-fixed">
                <thead>
                    <tr>
                        <th className="p-2 text-left text-white font-semibold align-middle" style={{backgroundColor: accentColor}}>Description</th>
                        <th className="p-2 text-right text-white font-semibold w-16 align-middle" style={{backgroundColor: accentColor}}>Qty</th>
                        <th className="p-2 text-right text-white font-semibold w-24 align-middle" style={{backgroundColor: accentColor}}>Unit Price</th>
                        <th className="p-2 text-right text-white font-semibold w-24 align-middle" style={{backgroundColor: accentColor}}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {salesOrder.lines.map((line, index) => {
                        const product = products.find(p => p.id === line.itemId);
                        return (
                        <tr key={index} className="border-b h-14 hover:bg-neutral-50/50 transition-colors">
                            <td className="p-2 align-middle">
                                <div className="flex items-center gap-2.5 min-h-[36px]">
                                    <div className="w-9 h-9 shrink-0 rounded border border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center p-0.5 shadow-2xs">
                                        <ProductImage
                                            path={product?.productImage}
                                            alt={line.description}
                                            width={500}
                                            height={500}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-xs leading-tight text-neutral-900 truncate">{line.description}</p>
                                        {product?.sku ? (
                                            <p className="text-[10px] text-muted-foreground leading-tight truncate">SKU: {product.sku}</p>
                                        ) : (
                                            <p className="text-[10px] text-neutral-400 leading-tight">No SKU</p>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="p-2 text-right font-semibold text-xs align-middle">{line.quantity}</td>
                            <td className="p-2 text-right text-xs align-middle">₱{Number(line.unitPrice || 0).toFixed(2)}</td>
                            <td className="p-2 text-right font-bold text-xs align-middle">₱{Number(line.total || 0).toFixed(2)}</td>
                        </tr>
                    )})}
                </tbody>
            </table>
            
            <div className="flex justify-end mt-3">
                <div className="w-1/2 md:w-5/12 text-xs space-y-0.5">
                    {showVat && (
                        <>
                            <div className="flex justify-between text-[11px] py-0.5"><span>Vatable Sales:</span> <span>₱{totals.vatableSales.toFixed(2)}</span></div>
                            <div className="flex justify-between text-[11px] py-0.5"><span>VAT-Exempt Sales:</span> <span>₱{totals.vatExemptSales.toFixed(2)}</span></div>
                            <div className="flex justify-between text-[11px] py-0.5"><span>Zero-Rated Sales:</span> <span>₱{totals.zeroRatedSales.toFixed(2)}</span></div>
                        </>
                    )}
                    <div className="flex justify-between font-semibold text-[11px] py-0.5"><span>Total Sales:</span> <span>₱{totals.totalSales.toFixed(2)}</span></div>
                    {totals.discountAmount > 0 && <div className="flex justify-between text-[11px] py-0.5 text-red-600"><span>Discount:</span> <span>- ₱{totals.discountAmount.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-[11px] py-0.5"><span>Subtotal:</span> <span>₱{(totals.totalSales - totals.discountAmount).toFixed(2)}</span></div>
                    {showVat && <div className="flex justify-between text-[11px] py-0.5"><span>VAT (12%):</span> <span>₱{totals.vatAmount.toFixed(2)}</span></div>}
                    <div className="flex justify-between font-bold text-sm mt-1.5 pt-1.5 border-t-2" style={{borderColor: accentColor}}>
                        <span>Total:</span>
                        <span>₱{salesOrder.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {showNotes && (
              <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                <div>
                  <h4 className="font-bold text-[11px]">Quotation Notes:</h4>
                  <p className="text-[11px] text-muted-foreground">{salesOrder.notes || "No quotation notes."}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[11px]">Sales Order Notes:</h4>
                  <p className="text-[11px] text-muted-foreground">{salesOrder.notes || "No sales order notes."}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-10 text-center text-xs">
                {renderSignature(verifiedBy)}
            </div>
        </div>
    );
}
