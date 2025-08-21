
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
import { Loader2, Warehouse, Hash, MapPin } from 'lucide-react';
import type { Warehouse as WarehouseType } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';

interface WarehouseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warehouse: Omit<WarehouseType, 'id' | 'createdAt' | 'modifiedAt'> & {id?: string}) => Promise<void>;
  warehouse: WarehouseType | null;
}

export default function WarehouseFormModal({ 
    isOpen, 
    onClose, 
    onSave,
    warehouse,
}: WarehouseFormModalProps) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [address, setAddress] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (warehouse) {
                setName(warehouse.name || '');
                setCode(warehouse.code || '');
                setAddress(warehouse.address || '');
                setIsPrimary(warehouse.isPrimary || false);
            } else {
                resetForm();
            }
        }
    }, [isOpen, warehouse]);

    const resetForm = () => {
        setName('');
        setCode('');
        setAddress('');
        setIsPrimary(false);
    }
    
    const handleSubmit = async () => {
        setIsSaving(true);
        
        const warehouseData = {
            id: warehouse?.id,
            name,
            code,
            address,
            isPrimary,
        };

        try {
            await onSave(warehouseData);
            onClose();
        } catch (error) {
            console.error("Failed to save warehouse", error);
            // Parent component handles toast
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{warehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
                    <DialogDescription>
                        {warehouse ? 'Update the details of this warehouse.' : 'Enter the details for the new warehouse.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="warehouse-name" className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-green-500" /> Warehouse Name</Label>
                            <Input id="warehouse-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Warehouse" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="warehouse-code" className="flex items-center gap-2"><Hash className="h-4 w-4 text-blue-500" /> Warehouse Code</Label>
                            <Input id="warehouse-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. WH-MAIN" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-500" /> Address</Label>
                        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter full address" />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch id="is-primary" checked={isPrimary} onCheckedChange={setIsPrimary} />
                        <Label htmlFor="is-primary">Set as primary warehouse</Label>
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {warehouse ? 'Save Changes' : 'Add Warehouse'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
