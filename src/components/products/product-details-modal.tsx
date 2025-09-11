
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
  Calendar as CalendarIcon,
  Pencil,
  User,
  Palette,
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
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductDetailsModalProps) {
  const { toast } = useToast();
  const [isDeactivateAlertOpen, setDeactivateAlertOpen] = useState(false);
  const { hasWriteAccess } = useAuth();
  const canWrite = hasWriteAccess('Products');

  if (!product) return null;

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    // Firestore timestamp
    if (date.toDate) return format(date.toDate(), 'PP');
    // String date
    return format(new Date(date), 'PP');
  }

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
      onToggleStatus(product);
      setDeactivateAlertOpen(false);
      onClose();
  }

  const handleDeleteClick = () => {
    onDelete(product);
    onClose();
  }

  const allDetails = [
    { label: 'SKU', value: product.sku, icon: Barcode, color: 'text-indigo-500' },
    { label: 'Supplier Name', value: product.supplier.name, icon: Truck, color: 'text-green-500' },
    { label: 'Supplier Contact', value: product.supplier.contact, icon: User, color: 'text-blue-500' },
    { label: 'Price', value: `₱${(product.price || 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'UOM', value: product.uom, icon: Scaling, color: 'text-purple-500' },
    { label: 'LED Qty', value: product.ledQty ? `${product.ledQty}L` : null, icon: Lightbulb, color: 'text-yellow-500' },
    { label: 'Voltage', value: product.voltage ? `${product.voltage}v` : null, icon: Zap, color: 'text-orange-500' },
    { label: 'Wattage', value: product.wattage ? `${product.wattage}w` : null, icon: Power, color: 'text-red-500' },
    { label: 'CCT', value: product.cct, icon: Palette, color: 'text-cyan-500' },
    { label: 'Meters', value: product.meters ? `${product.meters}m` : null, icon: Ruler, color: 'text-blue-500' },
    { label: 'Location', value: product.location, icon: MapPin, color: 'text-pink-500' },
    { label: 'Stock', value: product.stock, icon: Warehouse, color: 'text-green-500', status: product.status },
    { label: 'Re-Order Level', value: product.reOrderLevel, icon: AlertTriangle, color: 'text-yellow-500' },
    { label: 'Expiry Tracking', value: product.expiryDateTracking ? 'Enabled' : 'Disabled', icon: CalendarClock, color: 'text-cyan-500', isBool: true },
  ];

  const availableDetails = allDetails.filter(detail => detail.value !== null && detail.value !== undefined && detail.value !== '');
  
  const midPoint = Math.ceil(availableDetails.length / 2);
  const leftColumnDetails = availableDetails.slice(0, midPoint);
  const rightColumnDetails = availableDetails.slice(midPoint);
  
  const isActive = product.status !== 'Discontinued';
  
  const createdAt = formatDate(product.createdAt);
  const modifiedAt = formatDate(product.modifiedAt);

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-md">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <DialogTitle>{product.name}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <DialogDescription className="text-sm">{product.productCode}</DialogDescription>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1">
                        <LayoutGrid className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{product.category}</span>
                    </div>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
                <div>Created: {createdAt}</div>
                <div>Modified: {modifiedAt}</div>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-1">
            <ProductImage
              path={product.productImage}
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
              <div className="text-[13px] pl-7 grid grid-cols-2 gap-x-16">
                 <div className="space-y-2">
                    {leftColumnDetails.map(detail => {
                      const Icon = detail.icon;
                      return (
                         <div key={detail.label} className="flex items-center justify-between py-1 border-b border-dashed">
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
                              {detail.value as string}
                            </span>
                          ) : (
                            <span className="font-medium">{detail.value}</span>
                          )}
                        </div>
                      )
                    })}
                 </div>
                 <div className="space-y-2">
                    {rightColumnDetails.map(detail => {
                      const Icon = detail.icon;
                      return (
                         <div key={detail.label} className="flex items-center justify-between py-1 border-b border-dashed">
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
                              {detail.value as string}
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
        </div>
        <DialogFooter className="sm:justify-end">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => { onEdit(product); onClose(); }}
              className="bg-[#2C2C2C] text-white hover:bg-[#151515] hover:text-white"
               disabled={!canWrite}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setDeactivateAlertOpen(true)} disabled={!canWrite}>
              <Power className={`h-4 w-4 mr-2 ${isActive ? 'text-orange-500' : 'text-green-500'}`} />
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick} disabled={!canWrite}>
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
