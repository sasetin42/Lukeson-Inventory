
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Repeat, Package, Hash, AlertCircle } from 'lucide-react';
import { Product } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSave: (productId: string, newStock: number, reason: string) => void;
}

const adjustmentReasons = [
    "Stock Count Correction",
    "Damaged Goods",
    "Lost/Stolen Items",
    "Initial Stock Entry",
    "Other",
];

export default function StockAdjustmentModal({ 
    isOpen, 
    onClose, 
    products, 
    onSave 
}: StockAdjustmentModalProps) {
    const { toast } = useToast();
    const [selectedProductId, setSelectedProductId] = useState('');
    const [currentStock, setCurrentStock] = useState<number | null>(null);
    const [newStock, setNewStock] = useState('');
    const [reason, setReason] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (selectedProductId) {
            const product = products.find(p => p.id === selectedProductId);
            setCurrentStock(product?.stock ?? null);
            setNewStock('');
        } else {
            setCurrentStock(null);
        }
    }, [selectedProductId, products]);

    const resetForm = () => {
        setSelectedProductId('');
        setCurrentStock(null);
        setNewStock('');
        setReason('');
        setIsSaving(false);
    };
    
    const handleSubmit = () => {
        if (!selectedProductId || newStock === '' || !reason) {
            toast({
                title: "Missing Fields",
                description: "Please select a product, enter a new stock quantity, and select a reason.",
                variant: "destructive"
            });
            return;
        }

        const newStockNum = Number(newStock);
        if (isNaN(newStockNum) || newStockNum < 0) {
            toast({
                title: "Invalid Quantity",
                description: "Please enter a valid, non-negative number for the stock quantity.",
                variant: "destructive"
            });
            return;
        }
        
        setIsSaving(true);
        onSave(selectedProductId, newStockNum, reason);
        // isSaving and onClose will be handled by parent
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Repeat className="h-5 w-5 text-green-500" />
                        Adjust Stock Quantity
                    </DialogTitle>
                    <DialogDescription>
                        Manually update the stock level for a product. This should be used for corrections, not regular sales or purchases.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="product-select" className="flex items-center gap-2"><Package className="h-4 w-4" /> Product</Label>
                        <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                            <SelectTrigger id="product-select"><SelectValue placeholder="Select a product..." /></SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {currentStock !== null && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Hash className="h-4 w-4" /> Current Stock</Label>
                                <Input value={currentStock} disabled className="font-bold"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-stock" className="flex items-center gap-2"><Hash className="h-4 w-4 text-green-500" /> New Stock</Label>
                                <Input id="new-stock" type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} placeholder="Enter new quantity" />
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                         <Label htmlFor="reason-select" className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-yellow-500" /> Reason for Adjustment</Label>
                        <Select onValueChange={setReason} value={reason}>
                            <SelectTrigger id="reason-select"><SelectValue placeholder="Select a reason..." /></SelectTrigger>
                            <SelectContent>
                                {adjustmentReasons.map(r => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="cancel" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving || !selectedProductId || newStock === '' || !reason}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Adjust Stock
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
