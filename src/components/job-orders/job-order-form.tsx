
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JobOrder, DocumentLine, Customer, Product, SalesOrder, VatType, Quotation } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Loader2, User, Calendar, Hash, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { DatePicker } from '../ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

interface JobOrderFormProps {
  jobOrder: JobOrder | null;
  onSuccess: (jobOrderData: Omit<JobOrder, 'id'> & {id?: string}) => void;
  onCancel: () => void;
}

const DEFAULT_TAX_RATE = 0.12;

const safeToDate = (date: any): Date | undefined => {
    if (!date) return undefined;
    if (date.toDate) return date.toDate(); // Firestore Timestamp
    if (date instanceof Date) return date; // Javascript Date
    if (typeof date === 'string' || typeof date === 'number') return new Date(date); // ISO string or milliseconds
    return undefined;
}

export default function JobOrderForm({ jobOrder, onSuccess, onCancel }: JobOrderFormProps) {
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [jobOrderId, setJobOrderId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [salesOrderId, setSalesOrderId] = useState<string | undefined>();
    const [jobOrderDate, setJobOrderDate] = useState<Date | undefined>(new Date());
    const [expectedCompletionDate, setExpectedCompletionDate] = useState<Date | undefined>();
    const [salesOrderDeliveryDate, setSalesOrderDeliveryDate] = useState<Date | undefined>();
    const [status, setStatus] = useState<JobOrder['status']>('Draft');
    const [lines, setLines] = useState<DocumentLine[]>([]);
    const [notes, setNotes] = useState('');
    const [quotationNotes, setQuotationNotes] = useState('');
    const [salesOrderNotes, setSalesOrderNotes] = useState('');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const customersRef = collection(db, 'customers');
                const productsRef = collection(db, 'products');
                
                const customersSnapshot = await getDocs(customersRef);
                const loadedCustomers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
                setCustomers(loadedCustomers);
                
                const productsSnapshot = await getDocs(productsRef);
                const loadedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                setProducts(loadedProducts);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ title: "Error", description: "Failed to load customers and products.", variant: "destructive"});
            }
        };
        fetchData();
    }, [toast]);
    
    useEffect(() => {
        const generateJobOrderId = async () => {
            const joRef = collection(db, 'jobOrders');
            const snapshot = await getDocs(joRef);
            const joCount = snapshot.size;
            const year = new Date().getFullYear();
            setJobOrderId(`JO-${year}-${(joCount + 1).toString().padStart(4, '0')}`);
        };

        if (jobOrder) {
            setJobOrderId(jobOrder.id || '');
            setCustomerId(jobOrder.customerId || '');
            setSalesOrderId(jobOrder.salesOrderId);
            setJobOrderDate(safeToDate(jobOrder.jobOrderDate));
            setExpectedCompletionDate(safeToDate(jobOrder.expectedCompletionDate));
            setStatus(jobOrder.status || 'Draft');
            setLines(jobOrder.lines || []);
            setNotes(jobOrder.notes || '');

        } else {
            generateJobOrderId();
            setLines([]);
            setStatus('Scheduled');
            setCustomerId('');
            setSalesOrderId(undefined);
            setJobOrderDate(new Date());
            setExpectedCompletionDate(undefined);
            setSalesOrderDeliveryDate(undefined);
            setNotes('');
            setQuotationNotes('');
            setSalesOrderNotes('');
        }
    }, [jobOrder]);
    
    useEffect(() => {
        const fetchSalesOrders = async () => {
            if (!customerId) {
                setSalesOrders([]);
                return;
            }
            try {
                const soQuery = query(collection(db, 'salesOrders'), where("customerId", "==", customerId), where("status", "==", "Confirmed"));
                const soSnapshot = await getDocs(soQuery);
                const loadedSOs = soSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder));
                setSalesOrders(loadedSOs);

                // If editing a job order, ensure its SO is loaded and dates are set.
                if (jobOrder?.salesOrderId) {
                     const so = loadedSOs.find(s => s.id === jobOrder.salesOrderId) || salesOrders.find(s => s.id === jobOrder.salesOrderId);
                    if (so) {
                        setSalesOrderDeliveryDate(safeToDate(so.deliveryDate));
                    }
                }
            } catch (error) {
                 console.error("Error fetching sales orders:", error);
                 toast({ title: "Error", description: "Failed to load sales orders for customer.", variant: "destructive"});
            }
        }
        fetchSalesOrders();
    }, [customerId, toast, jobOrder?.salesOrderId]);


    const handleSalesOrderChange = async (selectedSOId: string) => {
        setSalesOrderId(selectedSOId);
        const so = salesOrders.find(s => s.id === selectedSOId);
        if (so) {
            setLines(so.lines);
            setSalesOrderNotes(so.notes || '');
            setSalesOrderDeliveryDate(safeToDate(so.deliveryDate));
            toast({ title: 'Sales Order Loaded', description: `Details from ${so.id} have been loaded.`})

            if (so.quotationId) {
                const qtnRef = doc(db, "quotations", so.quotationId);
                const qtnSnap = await getDoc(qtnRef);
                if (qtnSnap.exists()) {
                    const qtnData = qtnSnap.data() as Quotation;
                    setQuotationNotes(qtnData.notes || '');
                }
            } else {
                setQuotationNotes('');
            }
        }
    };
    
    const calculateTotalAmount = () => {
        return lines.reduce((acc, line) => acc + line.total, 0);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const customer = customers.find(c => c.id === customerId);
            
            // If new, set to In Progress, otherwise keep existing status
            const finalStatus = !jobOrder?.id ? 'In Progress' : status;

            const jobOrderData = {
                id: jobOrder?.id || jobOrderId,
                customerId,
                customerName: customer?.name || 'N/A',
                salesOrderId,
                jobOrderDate,
                expectedCompletionDate,
                status: finalStatus,
                lines,
                notes,
                totalAmount: calculateTotalAmount(),
            };
            onSuccess(jobOrderData);
        } catch (error) {
            console.error("Failed to save job order:", error);
            toast({ title: "Error", description: "Failed to save job order.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Hash className="h-4 w-4" /> Job Order ID</Label>
                    <Input value={jobOrderId} disabled />
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
                    <Select onValueChange={handleSalesOrderChange} value={salesOrderId} disabled={!customerId || salesOrders.length === 0}>
                        <SelectTrigger><SelectValue placeholder="Select a sales order" /></SelectTrigger>
                        <SelectContent>
                            {salesOrders.map(s => <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Job Order Date</Label>
                    <DatePicker date={jobOrderDate} setDate={setJobOrderDate} />
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Expected Completion</Label>
                    <DatePicker date={expectedCompletionDate} setDate={setExpectedCompletionDate} toDate={salesOrderDeliveryDate} />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Status</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as JobOrder['status'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="On Hold">On Hold</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Line Items</Label>
                    {salesOrderDeliveryDate && (
                        <div className="flex items-center gap-2 text-sm">
                            <Label>SO Delivery Date:</Label>
                            <Input value={format(salesOrderDeliveryDate, 'PP')} disabled className="w-auto bg-muted/50" />
                        </div>
                    )}
                </div>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80%]" style={{ backgroundColor: '#588D00', color: '#FFFFFF' }}>Product/Service</TableHead>
                                <TableHead className="text-right" style={{ backgroundColor: '#588D00', color: '#FFFFFF' }}>Qty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell>{line.description}</TableCell>
                                    <TableCell className="text-right">{line.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="quotation-notes">Quotation Notes</Label>
                    <Textarea id="quotation-notes" value={quotationNotes} placeholder="Notes from the linked quotation..." readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sales-order-notes">Sales Order Notes</Label>
                    <Textarea id="sales-order-notes" value={salesOrderNotes} placeholder="Notes from the linked sales order..." readOnly className="bg-muted/50" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Job Order Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes specific to this job order..."/>
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
                        {isSaving ? 'Saving...' : (jobOrder ? 'Save Changes' : 'Create Job Order')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
