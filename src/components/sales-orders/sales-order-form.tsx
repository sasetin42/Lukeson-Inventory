
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SalesOrder, DocumentLine, Customer, Product, Quotation, VatType, JobOrder } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, User, Calendar, Hash, FileText, PlusCircle, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { DatePicker } from '../ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';

interface SalesOrderFormProps {
  salesOrder: SalesOrder | null;
  onSuccess: (salesOrderData: Omit<SalesOrder, 'id'> & {id?: string}) => void;
  onCancel: () => void;
  onIdGenerated: (id: string) => void;
  jobOrders: JobOrder[];
}

const vatTypes: VatType[] = ['VATable', 'VAT-Exempt', 'Zero-Rated'];
const DEFAULT_TAX_RATE = 0.12;

export default function SalesOrderForm({ salesOrder, onSuccess, onCancel, onIdGenerated, jobOrders }: SalesOrderFormProps) {
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [salesOrderId, setSalesOrderId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [orderDate, setOrderDate] = useState<Date | undefined>(new Date());
    const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();
    const [status, setStatus] = useState<SalesOrder['status'] | 'Confirmed'>('Draft');
    const [lines, setLines] = useState<DocumentLine[]>([]);
    const [isStatusDisabled, setIsStatusDisabled] = useState(true);
    const [notes, setNotes] = useState('');
    const [quotationNotes, setQuotationNotes] = useState('');
    const [discountType, setDiscountType] = useState<'Fixed' | 'Percent'>('Fixed');
    const [discountValue, setDiscountValue] = useState(0);
    const [quotationId, setQuotationId] = useState<string | undefined>(undefined);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const customersRef = collection(db, 'customers');
                const productsRef = collection(db, 'products');
                const quotationsRef = collection(db, 'quotations');
                
                const customersSnapshot = await getDocs(customersRef);
                const loadedCustomers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
                setCustomers(loadedCustomers);
                
                const productsSnapshot = await getDocs(productsRef);
                const loadedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                setProducts(loadedProducts);

                const quotationsSnapshot = await getDocs(quotationsRef);
                const loadedQuotations = quotationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
                setQuotations(loadedQuotations);

            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ title: "Error", description: "Failed to load customers, products, and quotations.", variant: "destructive"});
            }
        };
        fetchData();
    }, [toast]);
    
    useEffect(() => {
        const generateSalesOrderId = async () => {
            const soRef = collection(db, 'salesOrders');
            const snapshot = await getDocs(soRef);
            const soCount = snapshot.size;
            const year = new Date().getFullYear();
            const newId = `SO-${year}-${(soCount + 1).toString().padStart(4, '0')}`;
            setSalesOrderId(newId);
            onIdGenerated(newId);
        };
        
        const hasJobOrder = salesOrder && jobOrders.some(jo => jo.salesOrderId === salesOrder.id);


        if (salesOrder) {
             if (salesOrder.id) { 
                setSalesOrderId(salesOrder.id);
                onIdGenerated(salesOrder.id);
                setStatus(salesOrder.status || 'Draft');
                setIsStatusDisabled(hasJobOrder); // Disable if job order exists
            } else { 
                generateSalesOrderId();
                setStatus('Confirmed');
                setIsStatusDisabled(false);
            }
            setCustomerId(salesOrder.customerId || '');
            setOrderDate(salesOrder.orderDate ? (salesOrder.orderDate instanceof Date ? salesOrder.orderDate : (salesOrder.orderDate as any).toDate()) : new Date());
            setDeliveryDate(salesOrder.deliveryDate ? (salesOrder.deliveryDate instanceof Date ? salesOrder.deliveryDate : (salesOrder.deliveryDate as any).toDate()) : undefined);
            setLines(salesOrder.lines || []);
            setNotes(salesOrder.notes || '');
            setDiscountType(salesOrder.discountType || 'Fixed');
            setDiscountValue(salesOrder.discountValue || 0);
            setQuotationId(salesOrder.quotationId);
            if (salesOrder.quotationId) {
                const linkedQuotation = quotations.find(q => q.id === salesOrder.quotationId);
                if (linkedQuotation) {
                    setQuotationNotes(linkedQuotation.notes || '');
                }
            } else {
                setQuotationNotes('');
            }
        } else {
            generateSalesOrderId();
            setLines([]);
            setStatus('Draft');
            setCustomerId('');
            setOrderDate(new Date());
            setDeliveryDate(undefined);
            setIsStatusDisabled(true);
            setNotes('');
            setQuotationNotes('');
            setDiscountType('Fixed');
            setDiscountValue(0);
            setQuotationId(undefined);
        }
    }, [salesOrder, onIdGenerated, quotations, jobOrders]);

    const handleCustomerChange = (selectedCustomerId: string) => {
        setCustomerId(selectedCustomerId);
        const approvedQuotation = quotations.find(q => q.customerId === selectedCustomerId && q.status === 'Accepted');

        if (approvedQuotation) {
            setLines(approvedQuotation.lines);
            setStatus('Confirmed');
            setIsStatusDisabled(false);
            setNotes(approvedQuotation.notes || '');
            setQuotationNotes(approvedQuotation.notes || '');
            setQuotationId(approvedQuotation.id);
            toast({
                title: "Quotation Found",
                description: `Populated line items from approved quotation ${approvedQuotation.id}.`,
                variant: 'success'
            });
        } else {
            setLines([]);
            setStatus('Draft');
            setIsStatusDisabled(true);
            setNotes('');
            setQuotationNotes('');
            setQuotationId(undefined);
        }
    }
    
    const handleAddLine = () => {
        const newLine: DocumentLine = {
            id: `line-${Date.now()}`,
            itemId: '',
            description: '',
            quantity: 1,
            uom: '',
            unitPrice: 0,
            vatType: 'VATable',
            taxRate: DEFAULT_TAX_RATE,
            total: 0,
        };
        setLines([...lines, newLine]);
    };

    const handleRemoveLine = (index: number) => {
        const newLines = [...lines];
        newLines.splice(index, 1);
        setLines(newLines);
    };

    const handleLineChange = (index: number, field: keyof DocumentLine, value: any) => {
        const newLines = [...lines];
        const line = newLines[index];
        (line as any)[field] = value;

        if (field === 'itemId') {
            const product = products.find(p => p.id === value);
            if (product) {
                line.description = product.name;
                line.unitPrice = product.price;
                line.uom = product.uom;
            }
        }
        
        if (field === 'vatType') {
            line.taxRate = value === 'VATable' ? DEFAULT_TAX_RATE : 0;
        }

        const subtotal = line.quantity * line.unitPrice;
        line.total = subtotal;

        setLines(newLines);
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
        if (!customerId) {
            toast({
                title: "Missing Field",
                description: "Please select a customer.",
                variant: "destructive",
                icon: <AlertCircle className="h-5 w-5" />
            });
            return;
        }

        if (!deliveryDate) {
            toast({
                title: "Missing Field",
                description: "Please select a delivery date.",
                variant: "destructive",
                icon: <AlertCircle className="h-5 w-5" />
            });
            return;
        }

        setIsSaving(true);
        try {
            const customer = customers.find(c => c.id === customerId);
            
            const salesOrderData = {
                id: salesOrder?.id || salesOrderId,
                customerId,
                customerName: customer?.name || 'N/A',
                customerTin: customer?.tin,
                customerEmail: customer?.email,
                customerPhone: customer?.phone,
                customerShippingAddress: customer?.shippingAddress,
                orderDate,
                deliveryDate,
                status: status as SalesOrder['status'],
                lines,
                notes,
                totalAmount: totals.totalAmount,
                quotationId,
                discountType,
                discountValue,
            };
            onSuccess(salesOrderData);
        } catch (error) {
            console.error("Failed to save sales order:", error);
            toast({ title: "Error", description: "Failed to save sales order.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User className="h-4 w-4" /> Customer <span className="text-red-500">*</span></Label>
                    <Select onValueChange={handleCustomerChange} value={customerId}>
                        <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                        <SelectContent>
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Order Date</Label>
                    <DatePicker date={orderDate} setDate={setOrderDate} />
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Delivery Date <span className="text-red-500">*</span></Label>
                    <DatePicker date={deliveryDate} setDate={setDeliveryDate} />
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Status <span className="text-red-500">*</span></Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as SalesOrder['status'])} disabled={isStatusDisabled}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                            <SelectItem value="Invoiced">Invoiced</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Line Items</Label>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[35%]">Product</TableHead>
                                <TableHead className="w-[10%]">Qty</TableHead>
                                <TableHead className="w-[15%]">Unit Price</TableHead>
                                <TableHead className="w-[20%]">VAT Type</TableHead>
                                <TableHead className="w-[15%] text-right">Total</TableHead>
                                <TableHead className="w-[5%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lines.map((line, index) => (
                                <TableRow key={line.id}>
                                    <TableCell>
                                        <Select value={line.itemId} onValueChange={(v) => handleLineChange(index, 'itemId', v)}>
                                            <SelectTrigger><SelectValue placeholder="Select Product"/></SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', Number(e.target.value))} />
                                    </TableCell>
                                    <TableCell>
                                        <Input type="number" value={line.unitPrice} onChange={e => handleLineChange(index, 'unitPrice', Number(e.target.value))} />
                                    </TableCell>
                                    <TableCell>
                                        <Select value={line.vatType} onValueChange={(v: VatType) => handleLineChange(index, 'vatType', v)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                {vatTypes.map(vt => <SelectItem key={vt} value={vt}>{vt}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">₱{line.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveLine(index)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddLine} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4"/> Add Line Item
                </Button>
            </div>
            
            <div className="flex gap-8">
                <div className="w-1/2 space-y-2">
                    {quotationId && (
                        <div className="space-y-2">
                            <Label htmlFor="quotation-notes">Quotation Notes (from {quotationId})</Label>
                            <Textarea id="quotation-notes" value={quotationNotes} readOnly rows={3} className="bg-muted/50" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Sales Order Notes (Optional)</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes for this sales order..."/>
                    </div>
                </div>
                <div className="w-1/2 space-y-2">
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

            <div className="flex justify-end items-center gap-6 mt-4">
                 <div className="flex justify-end gap-2">
                    <Button variant="cancel" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Saving...' : (salesOrder?.id ? 'Save Changes' : 'Create Sales Order')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
