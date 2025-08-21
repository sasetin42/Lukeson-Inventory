
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { Loader2, User, Hash, MapPin, Calendar, CreditCard, Truck } from 'lucide-react';

interface CustomerFormProps {
  customer: Customer | null;
  onSuccess: (customerData: Omit<Customer, 'id'> & {id?: string}) => void;
  onCancel: () => void;
}

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [tin, setTin] = useState('');
    const [billingAddress, setBillingAddress] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [termsDays, setTermsDays] = useState('30');
    const [creditLimit, setCreditLimit] = useState('10000');
    
    useEffect(() => {
        if (customer) {
            setName(customer.name || '');
            setTin(customer.tin || '');
            setBillingAddress(customer.billingAddress || '');
            setShippingAddress(customer.shippingAddress || '');
            setTermsDays(customer.termsDays?.toString() || '30');
            setCreditLimit(customer.creditLimit?.toString() || '10000');
        } else {
            resetForm();
        }
    }, [customer]);
    
    const resetForm = () => {
        setName('');
        setTin('');
        setBillingAddress('');
        setShippingAddress('');
        setTermsDays('30');
        setCreditLimit('10000');
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const customerData = {
                id: customer?.id,
                name,
                tin,
                billingAddress,
                shippingAddress,
                termsDays: Number(termsDays) || 0,
                creditLimit: Number(creditLimit) || 0,
                balance: customer?.balance || 0, // Keep existing balance on edit
            };
            onSuccess(customerData);
        } catch (error) {
            console.error("Failed to save customer:", error);
            // Parent handles toast
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User className="h-4 w-4" /> Customer Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Juan dela Cruz" />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Hash className="h-4 w-4" /> TIN</Label>
                    <Input value={tin} onChange={(e) => setTin(e.target.value)} placeholder="e.g. 123-456-789-000" />
                </div>
            </div>
            
            <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Billing Address</Label>
                <Textarea value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder="Enter billing address" />
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2"><Truck className="h-4 w-4" /> Shipping Address</Label>
                <Textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Enter shipping address (if different)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Payment Terms (Days)</Label>
                    <Input type="number" value={termsDays} onChange={(e) => setTermsDays(e.target.value)} placeholder="e.g. 30" />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Credit Limit</Label>
                    <Input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="e.g. 10000" />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : (customer ? 'Save Changes' : 'Add Customer')}
                </Button>
            </div>
        </div>
    );
}
