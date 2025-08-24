
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Invoice, DocumentLine, Customer, SalesOrder, VatType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Loader2, User, Calendar, Hash, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { DatePicker } from '../ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

interface InvoiceFormProps {
  invoice: Invoice | null;
  onSuccess: (invoiceData: Omit<Invoice, 'id'> & {id?: string}) => void;
  onCancel: () => void;
}

export default function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [invoiceId, setInvoiceId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [salesOrderId, setSalesOrderId] = useState<string | undefined>();
    const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [status, setStatus] = useState<Invoice['status']>('Draft');
    const [lines, setLines] = useState<DocumentLine[]>([]);
    const [notes, setNotes] = useState('');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const customersRef = collection(db, 'customers');
                const invoicesRef = collection(db, 'invoices');

                const customersSnapshot = await getDocs(customersRef);
                setCustomers(customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));

                const invoicesSnapshot = await getDocs(invoicesRef);
                setAllInvoices(invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));

            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ title: "Error", description: "Failed to load customers and invoices.", variant: "destructive"});
            }
        };
        fetchData();
    }, [toast]);
    
    useEffect(() => {
        const generateInvoiceId = async () => {
            const invoicesRef = collection(db, 'invoices');
            const snapshot = await getDocs(invoicesRef);
            const count = snapshot.size;
            const year = new Date().getFullYear();
            setInvoiceId(`INV-${year}-${(count + 1).toString().padStart(4, '0')}`);
        };

        if (invoice) {
            setInvoiceId(invoice.id || '');
            setCustomerId(invoice.customerId || '');
            setSalesOrderId(invoice.salesOrderId);
            setInvoiceDate(invoice.date ? (invoice.date as any).toDate() : new Date());
            setDueDate(invoice.dueDate ? (invoice.dueDate as any).toDate() : undefined);
            setStatus(invoice.status || 'Draft');
            setLines(invoice.lines || []);
            setNotes(invoice.notes || '');
        } else {
            generateInvoiceId();
            resetForm(false);
        }
    }, [invoice]);
    
    const resetForm = (keepCustomer: boolean) => {
        if(!keepCustomer) setCustomerId('');
        setSalesOrderId(undefined);
        setInvoiceDate(new Date());
        setDueDate(undefined);
        setStatus('Draft');
        setLines([]);
        setNotes('');
    }

    const availableSalesOrders = salesOrders.filter(so => {
        // Exclude if it's already linked to another invoice (and we are not editing that specific invoice)
        const isAlreadyInvoiced = allInvoices.some(inv => inv.salesOrderId === so.id && inv.id !== (invoice?.id || ''));
        return !isAlreadyInvoiced;
    });

    useEffect(() => {
        const fetchSalesOrders = async () => {
            if (!customerId) {
                setSalesOrders([]);
                resetForm(true);
                return;
            }
            try {
                // Only allow invoicing for Fulfilled Sales Orders
                const soQuery = query(collection(db, 'salesOrders'), where("customerId", "==", customerId), where("status", "==", "Fulfilled"));
                const soSnapshot = await getDocs(soQuery);
                const loadedSOs = soSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder));
                setSalesOrders(loadedSOs);
            } catch (error) {
                 console.error("Error fetching sales orders:", error);
                 toast({ title: "Error", description: "Failed to load sales orders for customer.", variant: "destructive"});
            }
        }
        fetchSalesOrders();
    }, [customerId, toast]);


    const handleSalesOrderChange = async (selectedSOId: string) => {
        setSalesOrderId(selectedSOId);
        const so = salesOrders.find(s => s.id === selectedSOId);
        if (so) {
            setLines(so.lines);
            setNotes(so.notes || '');
            const customer = customers.find(c => c.id === so.customerId);
            if(customer && customer.termsDays && so.orderDate) {
                const newDueDate = new Date((so.orderDate as any).toDate());
                newDueDate.setDate(newDueDate.getDate() + customer.termsDays);
                setDueDate(newDueDate);
            }
            toast({ title: 'Sales Order Loaded', description: `Details from ${so.id} have been loaded.`})
        }
    };
    
    const calculateTotalAmount = () => {
        return lines.reduce((acc, line) => acc + line.total, 0);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const customer = customers.find(c => c.id === customerId);
            if (!salesOrderId || !dueDate) {
                toast({title: "Missing Information", description: "Please select a sales order and ensure a due date is set.", variant: "destructive"});
                setIsSaving(false);
                return;
            }

            const invoiceData = {
                id: invoice?.id || invoiceId,
                customerId,
                customerName: customer?.name || 'N/A',
                salesOrderId,
                date: invoiceDate,
                dueDate: dueDate,
                status,
                lines,
                notes,
                amount: calculateTotalAmount(),
                paidAmount: 0,
                balance: calculateTotalAmount(),
            };
            onSuccess(invoiceData as any);
        } catch (error) {
            console.error("Failed to save invoice:", error);
            toast({ title: "Error", description: "Failed to save invoice.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Hash className="h-4 w-4" /> Invoice ID</Label>
                    <Input value={invoiceId} disabled />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User className="h-4 w-4" /> Customer</Label>
                    <Select onValueChange={setCustomerId} value={customerId}>
                        <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                        <SelectContent>
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Link Sales Order</Label>
                    <Select onValueChange={handleSalesOrderChange} value={salesOrderId} disabled={!customerId || availableSalesOrders.length === 0}>
                        <SelectTrigger><SelectValue placeholder="Select an SO" /></SelectTrigger>
                        <SelectContent>
                            {availableSalesOrders.map(s => <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Status</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as Invoice['status'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Posted">Posted</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Invoice Date</Label>
                    <DatePicker date={invoiceDate} setDate={setInvoiceDate} />
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Due Date</Label>
                    <DatePicker date={dueDate} setDate={setDueDate} />
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Line Items</Label>
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-2/5">Product/Service</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">UOM</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.description}</TableCell>
                                    <TableCell className="text-right">{line.quantity}</TableCell>
                                    <TableCell className="text-right">{line.uom}</TableCell>
                                    <TableCell className="text-right">₱{line.unitPrice.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">₱{line.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes from Sales Order</Label>
                <Textarea id="notes" value={notes} placeholder="Notes from the linked sales order will appear here..." readOnly className="bg-muted/50" />
            </div>

            <div className="flex justify-end items-center gap-6 mt-4">
                <div className="text-right">
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">₱{calculateTotalAmount().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                 <div className="flex justify-end gap-2">
                    <Button variant="cancel" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Saving...' : (invoice ? 'Save Changes' : 'Create Invoice')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
