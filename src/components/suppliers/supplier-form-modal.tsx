
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
import { Loader2, Truck, User, Mail, Phone, MapPin, FileText } from 'lucide-react';
import type { Supplier } from '@/lib/types';
import { Textarea } from '../ui/textarea';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  onUpdateSupplier: (supplierId: string, supplier: Partial<Supplier>) => Promise<void>;
  supplier: Supplier | null;
}

export default function SupplierFormModal({ 
    isOpen, 
    onClose, 
    onAddSupplier,
    onUpdateSupplier,
    supplier,
}: SupplierFormModalProps) {
    const [name, setName] = useState('');
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [contractTerms, setContractTerms] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (supplier) {
                setName(supplier.name || '');
                setContactName(supplier.contact.name || '');
                setEmail(supplier.contact.email || '');
                setPhone(supplier.contact.phone || '');
                setAddress(supplier.address || '');
                setContractTerms(supplier.contractTerms || '');
            } else {
                resetForm();
            }
        }
    }, [isOpen, supplier]);

    const resetForm = () => {
        setName('');
        setContactName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setContractTerms('');
    }
    
    const handleSubmit = async () => {
        setIsSaving(true);
        
        const supplierData = {
            name,
            contact: {
                name: contactName,
                email,
                phone,
            },
            address,
            contractTerms,
        };

        try {
            if (supplier) {
                await onUpdateSupplier(supplier.id, supplierData);
            } else {
                await onAddSupplier(supplierData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save supplier", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                    <DialogDescription>
                        {supplier ? 'Update the details of this supplier.' : 'Enter the details for the new supplier.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                
                    <div className="space-y-2">
                        <Label htmlFor="supplier-name" className="flex items-center gap-2"><Truck className="h-4 w-4 text-green-500" /> Supplier Name</Label>
                        <Input id="supplier-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ABC Electronics" />
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="contact-name" className="flex items-center gap-2"><User className="h-4 w-4 text-blue-500" /> Contact Person</Label>
                        <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. Juan dela Cruz" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-red-500" /> Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. juan@abc.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-purple-500" /> Phone</Label>
                            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 09171234567" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-500" /> Address</Label>
                        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter full address" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contract-terms" className="flex items-center gap-2"><FileText className="h-4 w-4 text-yellow-500" /> Contract Terms</Label>
                        <Textarea id="contract-terms" value={contractTerms} onChange={(e) => setContractTerms(e.target.value)} placeholder="e.g. 30-day payment terms" />
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {supplier ? 'Save Changes' : 'Add Supplier'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
