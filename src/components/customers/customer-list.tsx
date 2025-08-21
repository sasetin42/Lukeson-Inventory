
'use client'

import { useState } from 'react';
import { Customer } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CustomerListProps {
    customers: Customer[];
    onEdit: (customer: Customer) => void;
    onDelete: (customerId: string) => void;
}

export default function CustomerList({ customers, onEdit, onDelete }: CustomerListProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const openDeleteAlert = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteAlertOpen(true);
  }

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
        await onDelete(customerToDelete.id);
    } catch (error) {
        toast({ title: "Error", description: "Failed to delete customer.", variant: "destructive" });
    } finally {
        setIsDeleteAlertOpen(false);
        setCustomerToDelete(null);
    }
  };

  const handleViewSalesOrders = (customer: Customer) => {
    router.push(`/sales-orders?customerId=${customer.id}`);
  };

  return (
    <>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <Card key={customer.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://placehold.co/48x48.png`} alt={customer.name} data-ai-hint="person avatar" />
                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{customer.name}</CardTitle>
                <CardDescription>TIN: {customer.tin || 'N/A'}</CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(customer)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewSalesOrders(customer)}>View Sales Orders</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => openDeleteAlert(customer)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Billing Address</p>
              <p className="text-sm text-muted-foreground">{customer.billingAddress}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Shipping Address</p>
              <p className="text-sm text-muted-foreground">{customer.shippingAddress || 'Same as billing'}</p>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t mt-2">
                <span>Terms: {customer.termsDays} days</span>
                <span>Credit Limit: ₱{customer.creditLimit.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the customer.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
