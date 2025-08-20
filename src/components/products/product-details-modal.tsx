
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Product } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  LayoutGrid,
  Truck,
  DollarSign,
  Barcode,
  Lightbulb,
  Zap,
  Power,
  Ruler,
  Scaling,
  MapPin,
  Warehouse,
  AlertTriangle,
  CalendarClock,
  CheckCircle,
  XCircle,
  Package,
  FileText,
  AlignLeft,
  Info,
  Edit,
  Trash2,
  Building2,
  Percent,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ProductImage from './product-image';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ProductDetailsModalProps) {
  const { toast } = useToast();
  const [isDeactivateAlertOpen, setDeactivateAlertOpen] = useState(false);

  if (!product) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'default';
      case 'Low Stock':
        return 'secondary';
      case 'Out of Stock':
      case 'Discontinued':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const handleToggleStatus = async () => {
      const newStatus = product.status === 'Discontinued' ? 'In Stock' : 'Discontinued';
      try {
        const productRef = doc(db, 'products', product.id);
        await setDoc(productRef, { status: newStatus }, { merge: true });
        toast({ title: 'Success', description: `Product has been ${newStatus === 'Discontinued' ? 'deactivated' : 'activated'}.`, variant: 'success' });
        onClose();
      } catch (error) {
          toast({ title: 'Error', description: 'Failed to update product status.', variant: 'destructive'});
      } finally {
        setDeactivateAlertOpen(false);
      }
  }

  const handleDeleteClick = () => {
    onDelete(product);
    onClose();
  }

  const details = [
    { label: 'SKU', value: product.sku, icon: Barcode, color: 'text-indigo-500' },
    { label: 'Barcode', value: product.barcode, icon: Barcode, color: 'text-gray-500' },
    { label: 'Brand', value: product.brand, icon: Building2, color: 'text-indigo-500' },
    { label: 'Category', value: product.category, icon: LayoutGrid, color: 'text-red-500' },
    { label: 'Supplier', value: product.supplier, icon: Truck, color: 'text-green-500' },
    { label: 'Price', value: `₱${(product.price || 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'VAT Type', value: product.vatType, icon: Percent, color: 'text-green-500' },
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
  
  const isActive = product.status !== 'Discontinued';

  return (
    <>
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
            <ProductImage
              path={product.imageUpload}
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
              <p className="text-sm text-muted-foreground pl-7">
                {product.description || 'No description available.'}
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Details
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] pl-7">
                {details.map((detail) => {
                  if (!detail.value) return null;
                  const Icon = detail.icon;
                  return (
                    <div key={detail.label} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Icon className={`h-4 w-4 ${detail.color}`} />
                        {detail.label}
                      </span>
                      {detail.label === 'Stock' ? (
                        <Badge variant={getStatusVariant(detail.status as string)}>
                          {detail.value} ({detail.status})
                        </Badge>
                      ) : detail.isBool ? (
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            product.expiryDateTracking ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {product.expiryDateTracking ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          {detail.value}
                        </span>
                      ) : (
                        <span className="font-medium">{detail.value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { onEdit(product); onClose(); }}>
              <Edit className="h-4 w-4 mr-2 text-blue-500" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setDeactivateAlertOpen(true)}>
              <Power className={`h-4 w-4 mr-2 ${isActive ? 'text-orange-500' : 'text-green-500'}`} />
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <AlertDialog open={isDeactivateAlertOpen} onOpenChange={setDeactivateAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to {isActive ? 'deactivate' : 'activate'} this product?</AlertDialogTitle>
            <AlertDialogDescription>
                {isActive ? 'Deactivating this product will make it unavailable for sale.' : 'Activating this product will make it available for sale again.'}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>{isActive ? 'Deactivate' : 'Activate'}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
