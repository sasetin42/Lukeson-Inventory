
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Invoice, DocumentLine, Customer, SalesOrder, VatType, Quotation } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Loader2, User, Calendar, Hash, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { DatePicker } from '../ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '../ui/separator';

const DEFAULT_TAX_RATE = 0.12;

interface InvoiceFormProps {
  invoice: Invoice | null;
  onSuccess: (invoiceData: Omit<Invoice, 'id'> & {id?: string}) => void;
  onCancel: () => void;
  onIdGenerated: (id: string) => void;
}

export default function InvoiceForm({ invoice, onSuccess, onCancel, onIdGenerated }: InvoiceFormProps) {
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
    const [quotationNotes, setQuotationNotes] = useState('');

    const [discountType, setDiscountType] = useState<'Fixed' | 'Percent'>('Fixed');
    const [discountValue, setDiscountValue] = useState(0);
    
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
            const newId = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;
            setInvoiceId(newId);
            onIdGenerated(newId);
        };

        if (invoice && invoice.id) {
            setInvoiceId(invoice.id);
            onIdGenerated(invoice.id);
        } else if (invoice) { // From sales order
             generateInvoiceId();
             setCustomerId(invoice.customerId || '');
             setSalesOrderId(invoice.salesOrderId);
             setLines(invoice.lines || []);
             setNotes(invoice.notes || '');
             setDiscountType(invoice.discountType || 'Fixed');
             setDiscountValue(invoice.discountValue || 0);
        } else {
            generateInvoiceId();
            resetForm(false);
        }
    }, [invoice, onIdGenerated]);
    
    const resetForm = (keepCustomer: boolean) => {
        if(!keepCustomer) setCustomerId('');
        setSalesOrderId(undefined);
        setInvoiceDate(new Date());
        setDueDate(undefined);
        setStatus('Draft');
        setLines([]);
        setNotes('');
        setQuotationNotes('');
        setDiscountType('Fixed');
        setDiscountValue(0);
    }

    const availableSalesOrders = useMemo(() => {
        return salesOrders.filter(so => {
            const isAlreadyInvoiced = allInvoices.some(inv => inv.salesOrderId === so.id && inv.id !== (invoice?.id || ''));
            return !isAlreadyInvoiced;
        });
    }, [salesOrders, allInvoices, invoice]);

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
            if (so.quotationId) {
                const qtnRef = doc(db, 'quotations', so.quotationId);
                const qtnSnap = await getDoc(qtnRef);
                if (qtnSnap.exists()) {
                    setQuotationNotes((qtnSnap.data() as Quotation).notes || '');
                }
            } else {
                setQuotationNotes('');
            }

            setDiscountType(so.discountType || 'Fixed');
            setDiscountValue(so.discountValue || 0);

            toast({ title: 'Sales Order Loaded', description: `Details from ${so.id} have been loaded.`})
        }
    };
    
    const totals = useMemo(() => {
        const totalSales = lines.reduce((acc, l) => acc + l.total, 0);

        let vatableSales = 0;
        let vatExemptSales = 0;
        let zeroRatedSales = 0;

        const discountAmount = discountType === 'Fixed' 
            ? Math.min(discountValue, totalSales)
            : totalSales * (Math.min(discountValue, 100) / 100);

        const totalAfterDiscount = totalSales - discountAmount;
        let vatAmount = 0;

        if(totalSales > 0) {
            lines.forEach(line => {
                const proportion = line.total / totalSales;
                const lineDiscount = discountAmount * proportion;
                const discountedTotal = line.total - lineDiscount;

                if (line.vatType === 'VATable') {
                    const baseAmount = discountedTotal / (1 + line.taxRate)
                    vatableSales += baseAmount;
                    vatAmount += baseAmount * line.taxRate;
                } else if (line.vatType === 'VAT-Exempt') {
                    vatExemptSales += discountedTotal;
                } else if (line.vatType === 'Zero-Rated') {
                    zeroRatedSales += discountedTotal;
                }
            });
        }
        
        const totalAmount = totalAfterDiscount;
        
        return {
            vatableSales,
            vatExemptSales,
            zeroRatedSales,
            totalSales,
            discountAmount,
            vatAmount: vatAmount < 0 ? 0 : vatAmount,
            totalAmount: totalAmount < 0 ? 0 : totalAmount,
        }
    }, [lines, discountType, discountValue]);

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
                id: invoiceId,
                customerId,
                customerName: customer?.name || 'N/A',
                salesOrderId,
                date: invoiceDate,
                dueDate: dueDate,
                status,
                lines,
                notes,
                amount: totals.totalAmount,
                paidAmount: invoice?.paidAmount || 0,
                balance: totals.totalAmount - (invoice?.paidAmount || 0),
                discountType,
                discountValue,
                vatableSales: totals.vatableSales,
                vatExemptSales: totals.vatExemptSales,
                zeroRatedSales: totals.zeroRatedSales,
                vatAmount: totals.vatAmount,
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <SelectTrigger><SelectValue placeholder={!customerId ? "Select customer first" : "Select an SO"} /></SelectTrigger>
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

            <div className="flex gap-8">
                <div className="w-1/2 space-y-4">
                    {quotationNotes && (
                        <div className="space-y-2">
                            <Label htmlFor="quotation-notes">Quotation Notes</Label>
                            <Textarea id="quotation-notes" value={quotationNotes} readOnly rows={2} className="bg-muted/50" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Sales Order Notes</Label>
                        <Textarea id="notes" value={notes} placeholder="Notes from the linked sales order will appear here..." readOnly className="bg-muted/50" />
                    </div>
                </div>
                <div className="w-1/2 space-y-1">
                    <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Vatable Sales:</span>
                        <span className="font-medium">₱{totals.vatableSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">VAT-Exempt Sales:</span>
                        <span className="font-medium">₱{totals.vatExemptSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Zero-Rated Sales:</span>
                        <span className="font-medium">₱{totals.zeroRatedSales.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-1 font-semibold">
                        <span>Total Sales:</span>
                        <span>₱{totals.totalSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Discount:</span>
                        <div className="flex items-center gap-2">
                            <Select value={discountType} onValueChange={(v: 'Fixed' | 'Percent') => setDiscountType(v)}>
                                <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Fixed">Fixed</SelectItem>
                                    <SelectItem value="Percent">Percent</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="w-24 h-8" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">VAT ({DEFAULT_TAX_RATE * 100}%):</span>
                        <span className="font-medium">₱{totals.vatAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-1 text-xl font-bold">
                        <span>Amount Due:</span>
                        <span>₱{totals.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="cancel" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : (invoice ? 'Save Changes' : 'Create Invoice')}
                </Button>
            </div>
        </div>
    );
}

    