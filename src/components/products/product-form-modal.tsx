
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from '@/lib/types';
import ProductForm from './product-form';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (productData: Omit<Product, 'id' | 'createdAt'> & {id?: string; imageFile?: File | null}) => void;
}

export default function ProductFormModal({ 
    isOpen, 
    onClose, 
    product, 
    onSave,
}: ProductFormModalProps) {

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
                {product ? 'Update the details of this product.' : 'Fill in the details below to add a new product.'}
            </DialogDescription>
            </DialogHeader>
            <ProductForm product={product} onSuccess={onSave} onCancel={onClose}/>
        </DialogContent>
        </Dialog>
    );
}
