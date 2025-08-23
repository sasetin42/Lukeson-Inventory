
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Customer } from '@/lib/types';
import { Button } from '../ui/button';
import { User, Hash, MapPin, Calendar, CreditCard, Truck, Mail, Phone, DollarSign } from 'lucide-react';
import { Separator } from '../ui/separator';

interface CustomerViewModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerViewModal({
  customer,
  isOpen,
  onClose,
}: CustomerViewModalProps) {
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
            <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 rounded-md">
                    <User className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                    <DialogTitle>{customer.name}</DialogTitle>
                    <DialogDescription>
                        Customer Details
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 gap-y-3">
            {customer.email && (
                <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{customer.email}</span>
                </div>
            )}
             {customer.phone && (
                <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{customer.phone}</span>
                </div>
            )}
             <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                    <p className="font-medium text-sm">Billing Address</p>
                    <p className="text-sm text-muted-foreground">{customer.billingAddress}</p>
                </div>
             </div>
             <div className="flex items-start gap-3">
                <Truck className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                    <p className="font-medium text-sm">Shipping Address</p>
                    <p className="text-sm text-muted-foreground">{customer.shippingAddress || 'Same as billing address'}</p>
                </div>
             </div>
          </div>
          <Separator />
           <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">TIN:</span>
                    <span className="text-sm font-semibold">{customer.tin || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Terms:</span>
                    <span className="text-sm font-semibold">{customer.termsDays} days</span>
                </div>
                <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Credit Limit:</span>
                    <span className="text-sm font-semibold">₱{customer.creditLimit.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Balance:</span>
                    <span className="text-sm font-semibold">₱{customer.balance.toLocaleString()}</span>
                </div>
           </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
