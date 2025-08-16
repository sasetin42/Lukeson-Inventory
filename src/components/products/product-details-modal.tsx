
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/lib/types";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

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
    { label: 'SKU', value: product.sku },
    { label: 'Category', value: product.category },
    { label: 'Supplier', value: product.supplier },
    { label: 'Location', value: product.location },
    { label: 'Stock', value: product.stock, variant: getStatusVariant(product.status) },
    { label: 'Re-Order Level', value: product.reOrderLevel },
    { label: 'Cost', value: `₱${(product.cost || 0).toFixed(2)}` },
    { label: 'Price', value: `₱${(product.price || 0).toFixed(2)}` },
    { label: 'LED Qty', value: product.ledQty },
    { label: 'Voltage', value: `${product.voltage}v` },
    { label: 'Wattage', value: `${product.wattage}w` },
    { label: 'Meters', value: `${product.meters}m` },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.productCode}</DialogDescription>
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
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{product.description || 'No description available.'}</p>
            </div>
            <Separator />
            <div>
                <h4 className="font-semibold mb-2">Details</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                    {details.map(detail => (
                        <div key={detail.label} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{detail.label}</span>
                            {detail.label === 'Stock' ? (
                               <Badge variant={detail.variant as any}>{product.status}</Badge>
                            ) : (
                                <span className="font-medium">{detail.value}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
