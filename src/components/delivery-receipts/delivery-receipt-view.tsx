'use client';

import { useMemo, useState, useEffect } from 'react';
import { SalesOrder, Product } from '@/lib/types';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ProductImage from '../products/product-image';

interface DeliveryReceiptViewProps {
  salesOrder: SalesOrder;
  products?: Product[];
}

const TEMPLATE_DOC_ID = 'salesOrder';

export default function DeliveryReceiptView({ salesOrder, products = [] }: DeliveryReceiptViewProps) {
  const [templateSettings, setTemplateSettings] = useState({
    accentColor: '#0A3BAA',
    companyName: 'LUKESON LIGHTING AND ELECTRICAL SERVICES COMPANY',
    address: '20 Genoveva St. Brgy. Gulod Novaliches, 1114 Quezon City, Philippines.',
    phone: 'Phone: 09176018881 | 09178162341',
    website: 'https://www.lukesonlighting.com.ph',
    logo: 'https://placehold.co/100x50.png',
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
        console.error('Error fetching template settings for DR view:', error);
      }
    };
    fetchSettings();
  }, []);

  const { accentColor, companyName, address, phone, website, logo } = templateSettings;

  const totalQuantity = useMemo(() => {
    return salesOrder.lines.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0);
  }, [salesOrder.lines]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return format(date.toDate ? date.toDate() : new Date(date), 'PP');
  };

  const drNumber = salesOrder.id ? salesOrder.id.replace(/^SO-/, 'DR-') : 'DR-PENDING';

  return (
    <div className="p-6 bg-white text-black print:p-0 print:m-0 text-xs">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold text-[15px] leading-tight" style={{ color: accentColor }}>
              {companyName}
            </p>
            <div className="text-[11px] leading-snug text-neutral-600 mt-0.5 space-y-0.5">
              <p>{address}</p>
              <p>{phone}</p>
              <p>{website}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="font-bold text-[16px] leading-tight text-blue-700" style={{ color: accentColor }}>
            DELIVERY RECEIPT
          </h2>
          <div className="text-[11px] leading-snug text-neutral-700 mt-1 space-y-0.5">
            <p><strong>DR No:</strong> <span className="font-semibold">{drNumber}</span></p>
            <p><strong>SO Ref:</strong> {salesOrder.id}</p>
            <p><strong>Date:</strong> {formatDate(salesOrder.deliveryDate || salesOrder.orderDate)}</p>
          </div>
        </div>
      </div>

      {/* Customer & Destination Information */}
      <div className="mt-4 text-xs grid grid-cols-2 gap-6 pb-2">
        <div>
          <p className="text-[11px] font-bold text-neutral-900 mb-0.5">DELIVER TO / CUSTOMER:</p>
          <div className="text-[11px] leading-tight text-neutral-700 space-y-0.5">
            <p className="font-semibold text-neutral-900">{salesOrder.customerName}</p>
            {salesOrder.customerTin && <p>TIN: {salesOrder.customerTin}</p>}
            {salesOrder.customerPhone && <p>Contact: {salesOrder.customerPhone}</p>}
            {salesOrder.customerEmail && <p>Email: {salesOrder.customerEmail}</p>}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold text-neutral-900 mb-0.5">DELIVERY / SHIPPING ADDRESS:</p>
          <div className="text-[11px] leading-tight text-neutral-700">
            {salesOrder.customerShippingAddress ? (
              <p>{salesOrder.customerShippingAddress}</p>
            ) : (
              <p className="text-neutral-500 italic">Same as customer address.</p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mt-3 border-collapse text-xs table-fixed">
        <thead>
          <tr className="text-white" style={{ backgroundColor: accentColor }}>
            <th className="p-2 text-center font-semibold w-10 align-middle">#</th>
            <th className="p-2 text-left font-semibold align-middle">Item Description & Specification</th>
            <th className="p-2 text-center font-semibold w-24 align-middle">Qty Delivered</th>
            <th className="p-2 text-center font-semibold w-28 align-middle">Remarks / Status</th>
          </tr>
        </thead>
        <tbody>
          {salesOrder.lines.map((line, index) => {
            const product = products.find(p => p.id === line.itemId);
            return (
              <tr key={index} className="border-b h-14 hover:bg-neutral-50/50 transition-colors">
                <td className="p-2 text-center text-neutral-500 align-middle font-medium">{index + 1}</td>
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
                <td className="p-2 text-center font-bold text-xs align-middle">{line.quantity}</td>
                <td className="p-2 text-center text-neutral-600 text-[11px] align-middle">Good Condition</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 font-semibold" style={{ borderColor: accentColor }}>
            <td colSpan={2} className="p-2 text-right">Total Items / Units Delivered:</td>
            <td className="p-2 text-center font-bold text-sm">{totalQuantity}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      {/* Notes / Special Instructions */}
      {salesOrder.notes && (
        <div className="mt-4 p-2.5 bg-neutral-50 border rounded text-xs">
          <p className="font-bold text-[11px] text-neutral-800">Delivery Notes / Instructions:</p>
          <p className="text-[11px] text-neutral-600 mt-0.5">{salesOrder.notes}</p>
        </div>
      )}

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-6 mt-10 pt-4 text-center text-[11px]">
        <div>
          <p className="text-neutral-500 mb-8">Prepared / Dispatched By:</p>
          <p className="border-t border-black font-semibold pt-1">Authorized Storekeeper / Logistics</p>
        </div>
        <div>
          <p className="text-neutral-500 mb-8">Delivered By:</p>
          <p className="border-t border-black font-semibold pt-1">Driver / Courier Signature</p>
        </div>
        <div>
          <p className="text-neutral-500 mb-8">Received Above Goods in Good Order & Condition:</p>
          <p className="border-t border-black font-semibold pt-1">Customer Signature over Printed Name</p>
        </div>
      </div>
    </div>
  );
}
