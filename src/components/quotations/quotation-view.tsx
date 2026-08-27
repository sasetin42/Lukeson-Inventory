'use client';

import { useMemo, useState, useEffect } from 'react';
import { Quotation, Product, Customer } from '@/lib/types';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Badge } from '../ui/badge';
import ProductImage from '../products/product-image';

interface QuotationViewProps {
  quotation: Quotation;
  products?: Product[];
}

const TEMPLATE_DOC_ID = 'quotation';

export default function QuotationView({ quotation, products = [] }: QuotationViewProps) {
  const [templateSettings, setTemplateSettings] = useState({
    accentColor: '#0A3BAA',
    companyName: 'LUKESON LIGHTING AND ELECTRICAL SERVICES COMPANY',
    address: '20 Genoveva St. Brgy. Gulod Novaliches, 1114 Quezon City, Philippines.',
    phone: 'Phone: 09176018881 | 09178162341',
    website: 'https://www.lukesonlighting.com.ph',
    logo: 'https://placehold.co/100x50.png',
    showNotes: true,
    showVat: true,
    terms: '1. Quotation is valid until the specified expiry date.\n2. Prices are subject to change without prior notice upon expiry.\n3. Orders arising from this quotation are subject to item availability.',
    verifiedBy: 'HIROYOSHI KANAZAWA - VP\nAuthorized Representative Signature',
  });

  const [customerData, setCustomerData] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const templateRef = doc(db, 'templates', TEMPLATE_DOC_ID);
        const docSnap = await getDoc(templateRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as typeof templateSettings;
          const cName =
            data.companyName === 'YAMASHITA MOLD PHILIPPINES CORPORATION' ||
            data.companyName === 'LUKESON COMPANY' ||
            !data.companyName
              ? 'LUKESON LIGHTING AND ELECTRICAL SERVICES COMPANY'
              : data.companyName;
          const cAddr =
            data.address?.includes('Daichi') ||
            data.address === '20 Genoveva, Novaliches, Quezon City, Metro Manila' ||
            !data.address
              ? '20 Genoveva St. Brgy. Gulod Novaliches, 1114 Quezon City, Philippines.'
              : data.address;
          const cPhone =
            data.phone?.includes('972-1848') || data.phone?.includes('912 378 5841') || !data.phone
              ? 'Phone: 09176018881 | 09178162341'
              : data.phone;
          const cWeb =
            data.website?.includes('yamashitamold') ||
            data.website === 'https://lukesonlighting.com.ph/' ||
            !data.website
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

        if (quotation.customerId) {
          const custRef = doc(db, 'customers', quotation.customerId);
          const custSnap = await getDoc(custRef);
          if (custSnap.exists()) {
            setCustomerData({ id: custSnap.id, ...custSnap.data() } as Customer);
          }
        }
      } catch (error) {
        console.error('Error fetching template settings for quotation view:', error);
      }
    };
    fetchSettings();
  }, [quotation.customerId]);

  const { accentColor, companyName, address, phone, website, logo, showNotes, showVat, terms, verifiedBy } =
    templateSettings;

  const totals = useMemo(() => {
    const totalSales = quotation.lines.reduce((acc, l) => acc + (Number(l.total) || 0), 0);
    const discountableSales = quotation.lines
      .filter((l) => l.isDiscountable !== false)
      .reduce((acc, l) => acc + (Number(l.total) || 0), 0);

    let vatableSales = 0;
    let vatExemptSales = 0;
    let zeroRatedSales = 0;

    const discountAmount =
      quotation.discountType === 'Fixed'
        ? Math.min(quotation.discountValue || 0, discountableSales)
        : discountableSales * (Math.min(quotation.discountValue || 0, 100) / 100);

    const totalAfterDiscount = totalSales - discountAmount;
    let vatAmount = 0;

    if (totalSales > 0) {
      quotation.lines.forEach((line) => {
        const isLineDiscountable = line.isDiscountable !== false;
        let lineDiscount = 0;
        if (isLineDiscountable && discountableSales > 0) {
          const proportion = (Number(line.total) || 0) / discountableSales;
          lineDiscount = discountAmount * proportion;
        }
        const discountedTotal = (Number(line.total) || 0) - lineDiscount;

        if (line.vatType === 'VATable' || !line.vatType) {
          const rate = Number(line.taxRate) || 0.12;
          const baseAmount = discountedTotal / (1 + rate);
          vatableSales += baseAmount;
          vatAmount += baseAmount * rate;
        } else if (line.vatType === 'VAT-Exempt') {
          vatExemptSales += discountedTotal;
        } else if (line.vatType === 'Zero-Rated') {
          zeroRatedSales += discountedTotal;
        }
      });
    }

    return {
      vatableSales,
      vatExemptSales,
      zeroRatedSales,
      totalSales,
      discountAmount,
      vatAmount: vatAmount < 0 ? 0 : vatAmount,
      totalAmount: totalAfterDiscount < 0 ? 0 : totalAfterDiscount,
    };
  }, [quotation.lines, quotation.discountType, quotation.discountValue]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return format(date.toDate ? date.toDate() : new Date(date), 'PP');
  };

  const getQuotationStatusVariant = (status?: Quotation['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!status) return 'outline';
    switch (status) {
      case 'Accepted':
        return 'default';
      case 'Sent':
        return 'secondary';
      case 'Draft':
        return 'outline';
      case 'Expired':
        return 'destructive';
      default:
        return 'outline';
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
    );
  };

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
            PRICE QUOTATION
          </h2>
          <div className="text-[11px] leading-snug text-neutral-700 mt-1 space-y-0.5">
            <p>
              <strong>Quotation No:</strong> <span className="font-semibold">{quotation.id}</span>
            </p>
            <p>
              <strong>Date:</strong> {formatDate(quotation.qtnDate)}
            </p>
            {quotation.expiryDate && (
              <p>
                <strong>Valid Until:</strong> {formatDate(quotation.expiryDate)}
              </p>
            )}
          </div>
          <div className="flex justify-end items-center gap-1.5 mt-1.5">
            <span className="text-[10px] font-semibold text-neutral-600">Status:</span>
            <Badge variant={getQuotationStatusVariant(quotation.status)} className="text-[10px] py-0 px-1.5">
              {quotation.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Customer & Destination Information */}
      <div className="mt-4 text-xs grid grid-cols-2 gap-6 pb-2">
        <div>
          <p className="text-[11px] font-bold text-neutral-900 mb-0.5">QUOTATION PREPARED FOR:</p>
          <div className="text-[11px] leading-tight text-neutral-700 space-y-0.5">
            <p className="font-semibold text-neutral-900">{customerData?.name || quotation.customerName || quotation.customerId}</p>
            {customerData?.tin && <p>TIN: {customerData.tin}</p>}
            {customerData?.phone && <p>Contact: {customerData.phone}</p>}
            {customerData?.email && <p>Email: {customerData.email}</p>}
            {customerData?.billingAddress && <p>Address: {customerData.billingAddress}</p>}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold text-neutral-900 mb-0.5">PROJECT / REMARKS:</p>
          <div className="text-[11px] leading-tight text-neutral-700">
            <p>{quotation.notes || 'Formal price proposal for requested goods and services.'}</p>
          </div>
        </div>
      </div>

      {/* Item Table */}
      <table className="w-full mt-3 border-collapse text-xs table-fixed">
        <thead>
          <tr>
            <th className="p-2 text-center text-white font-semibold w-10 align-middle" style={{ backgroundColor: accentColor }}>
              #
            </th>
            <th className="p-2 text-left text-white font-semibold align-middle" style={{ backgroundColor: accentColor }}>
              Item Description & Specification
            </th>
            <th className="p-2 text-right text-white font-semibold w-16 align-middle" style={{ backgroundColor: accentColor }}>
              Qty
            </th>
            <th className="p-2 text-center text-white font-semibold w-16 align-middle" style={{ backgroundColor: accentColor }}>
              UOM
            </th>
            <th className="p-2 text-right text-white font-semibold w-24 align-middle" style={{ backgroundColor: accentColor }}>
              Unit Price
            </th>
            <th className="p-2 text-right text-white font-semibold w-24 align-middle" style={{ backgroundColor: accentColor }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {quotation.lines.map((line, index) => {
            const product = products.find((p) => p.id === line.itemId);
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
                <td className="p-2 text-right font-semibold text-xs align-middle">{line.quantity}</td>
                <td className="p-2 text-center text-neutral-600 text-xs align-middle">{line.uom || 'pc'}</td>
                <td className="p-2 text-right text-xs align-middle">₱{Number(line.unitPrice || 0).toFixed(2)}</td>
                <td className="p-2 text-right font-bold text-xs align-middle">₱{Number(line.total || 0).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="flex justify-end mt-3">
        <div className="w-1/2 md:w-5/12 text-xs space-y-0.5">
          {showVat && (
            <>
              <div className="flex justify-between text-[11px] py-0.5">
                <span>Vatable Sales:</span> <span>₱{totals.vatableSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] py-0.5">
                <span>VAT-Exempt Sales:</span> <span>₱{totals.vatExemptSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] py-0.5">
                <span>Zero-Rated Sales:</span> <span>₱{totals.zeroRatedSales.toFixed(2)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-semibold text-[11px] py-0.5">
            <span>Total Gross Sales:</span> <span>₱{totals.totalSales.toFixed(2)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-[11px] py-0.5 text-red-600">
              <span>Discount:</span> <span>- ₱{totals.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-[11px] py-0.5">
            <span>Subtotal:</span> <span>₱{(totals.totalSales - totals.discountAmount).toFixed(2)}</span>
          </div>
          {showVat && (
            <div className="flex justify-between text-[11px] py-0.5">
              <span>VAT (12%):</span> <span>₱{totals.vatAmount.toFixed(2)}</span>
            </div>
          )}
          <div
            className="flex justify-between font-bold text-sm mt-1.5 pt-1.5 border-t-2"
            style={{ borderColor: accentColor }}
          >
            <span>Total Quoted Amount:</span>
            <span>₱{quotation.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      {showNotes && (
        <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
          <div>
            <h4 className="font-bold text-[11px] text-neutral-800">Terms & Conditions:</h4>
            <p className="text-[10px] text-neutral-600 mt-0.5 whitespace-pre-line leading-snug">
              {terms}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[11px] text-neutral-800">Quotation Notes / Remarks:</h4>
            <p className="text-[10px] text-neutral-600 mt-0.5 leading-snug">
              {quotation.notes || 'Thank you for your business interest. We look forward to serving your needs.'}
            </p>
          </div>
        </div>
      )}

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 mt-8 pt-4 text-center text-xs">
        <div>
          <p className="text-neutral-500 mb-8">Prepared / Issued By:</p>
          <div className="inline-block">{renderSignature(verifiedBy)}</div>
        </div>
        <div>
          <p className="text-neutral-500 mb-8">Conforme / Customer Acceptance:</p>
          <div>
            <p className="font-bold">{quotation.customerName || 'Customer Authorized Signatory'}</p>
            <p className="border-t border-black pt-1 mt-1">Signature Over Printed Name / Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
