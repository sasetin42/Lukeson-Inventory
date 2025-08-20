
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
import { useRouter } from 'next/navigation';


interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}


export default function ProductFormModal({ 
    isOpen, 
    onClose, 
    product, 
}: ProductFormModalProps) {

    const handleSuccess = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
                {product ? 'Update the details of this product.' : 'Fill in the details below to add a new product.'}
            </DialogDescription>
            </DialogHeader>
            <ProductForm product={product} onSuccess={handleSuccess} onCancel={onClose}/>
        </DialogContent>
        </Dialog>
    );
}
