
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/lib/types";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { LayoutGrid, Truck, DollarSign, Barcode, Lightbulb, Zap, Power, Ruler, Scaling, MapPin, Warehouse, AlertTriangle, CalendarClock, CheckCircle, XCircle, Package, FileText, AlignLeft, Info } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  if (!product) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'In Stock':
            return 'default';
        case 'Low Stock':
            return 'secondary';
        case 'Out of Stock':
            return 'destructive';
        default:
            return 'outline';
    }
  };

  const details = [
    { label: 'SKU', value: product.sku, icon: Barcode, color: 'text-indigo-500' },
    { label: 'Category', value: product.category, icon: LayoutGrid, color: 'text-red-500' },
    { label: 'Supplier', value: product.supplier, icon: Truck, color: 'text-green-500' },
    { label: 'Price', value: `₱${(product.price || 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Cost', value: `₱${(product.cost || 0).toFixed(2)}`, icon: DollarSign, color: 'text-orange-500' },
    { label: 'UOM', value: product.uom, icon: Scaling, color: 'text-purple-500' },
    { label: 'LED Qty', value: product.ledQty ? `${product.ledQty}L` : 'N/A', icon: Lightbulb, color: 'text-yellow-500' },
    { label: 'Voltage', value: product.voltage ? `${product.voltage}v` : 'N/A', icon: Zap, color: 'text-orange-500' },
    { label: 'Wattage', value: product.wattage ? `${product.wattage}w` : 'N/A', icon: Power, color: 'text-red-500' },
    { label: 'Meters', value: product.meters ? `${product.meters}m` : 'N/A', icon: Ruler, color: 'text-blue-500' },
    { label: 'Location', value: product.location, icon: MapPin, color: 'text-pink-500' },
    { label: 'Stock', value: product.stock, icon: Warehouse, color: 'text-green-500', status: product.status },
    { label: 'Re-Order Level', value: product.reOrderLevel, icon: AlertTriangle, color: 'text-yellow-500' },
    { label: 'Expiry Tracking', value: product.expiryDateTracking ? 'Enabled' : 'Disabled', icon: CalendarClock, color: 'text-cyan-500', isBool: true },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
            <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-500" />
                <DialogTitle>{product.name}</DialogTitle>
            </div>
            <div className="flex items-center gap-2 ml-8 text-muted-foreground">
                <FileText className="h-4 w-4 text-gray-400" />
                <DialogDescription>{product.productCode}</DialogDescription>
            </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-1">
            <Image
              src={product.imageUrl || 'https://placehold.co/300x300.png'}
              alt={product.name}
              width={300}
              height={300}
              className="rounded-lg object-cover w-full aspect-square"
              data-ai-hint="product image"
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlignLeft className="h-5 w-5 text-gray-500" />
                Description
              </h4>
              <p className="text-sm text-muted-foreground pl-7">{product.description || 'No description available.'}</p>
            </div>
            <Separator />
            <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Details
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] pl-7">
                    {details.map(detail => {
                        const Icon = detail.icon;
                        return (
                            <div key={detail.label} className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Icon className={`h-4 w-4 ${detail.color}`} />
                                    {detail.label}
                                </span>
                                {detail.label === 'Stock' ? (
                                   <Badge variant={getStatusVariant(detail.status as string)}>{detail.value} ({detail.status})</Badge>
                                ) : detail.isBool ? (
                                   <span className={`flex items-center gap-1 font-medium ${product.expiryDateTracking ? 'text-green-600' : 'text-red-600'}`}>
                                       {product.expiryDateTracking ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                       {detail.value}
                                   </span>
                                ) : (
                                    <span className="font-medium">{detail.value}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
