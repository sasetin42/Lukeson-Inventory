
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SalesOrder, DocumentLine, Customer, Product } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, User, Calendar, Hash, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { DatePicker } from '../ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SalesOrderFormProps {
  salesOrder: SalesOrder | null;
  onSuccess: (salesOrderData: Omit<SalesOrder, 'id'> & {id?: string}) => void;
  onCancel: () => void;
}

export default function SalesOrderForm({ salesOrder, onSuccess, onCancel }: SalesOrderFormProps) {
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [salesOrderId, setSalesOrderId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [orderDate, setOrderDate] = useState<Date | undefined>(new Date());
    const [status, setStatus] = useState<SalesOrder['status']>('Draft');
    const [lines, setLines] = useState<DocumentLine[]>([]);
    
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
        const generateSalesOrderId = async () => {
            const soRef = collection(db, 'salesOrders');
            const snapshot = await getDocs(soRef);
            const soCount = snapshot.size;
            const year = new Date().getFullYear();
            setSalesOrderId(`SO-${year}-${(soCount + 1).toString().padStart(4, '0')}`);
        };

        if (salesOrder) {
            setSalesOrderId(salesOrder.id || '');
            setCustomerId(salesOrder.customerId || '');
            setOrderDate(salesOrder.orderDate ? (salesOrder.orderDate as any).toDate() : new Date());
            setStatus(salesOrder.status || 'Draft');
            setLines(salesOrder.lines || []);
        } else {
            generateSalesOrderId();
            setLines([]);
        }
    }, [salesOrder]);
    
    const handleAddLine = () => {
        const newLine: DocumentLine = {
            id: `line-${Date.now()}`,
            itemId: '',
            description: '',
            quantity: 1,
            uom: '',
            unitPrice: 0,
            taxRate: 0.12, // Default tax
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
        (newLines[index] as any)[field] = value;

        if (field === 'itemId') {
            const product = products.find(p => p.id === value);
            if (product) {
                newLines[index].description = product.name;
                newLines[index].unitPrice = product.price;
                newLines[index].uom = product.uom;
            }
        }
        
        // Recalculate total
        const line = newLines[index];
        const subtotal = line.quantity * line.unitPrice;
        const discountAmount = subtotal * (line.discount || 0) / 100;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * line.taxRate;
        line.total = taxableAmount + taxAmount;

        setLines(newLines);
    };

    const calculateTotalAmount = () => {
        return lines.reduce((acc, line) => acc + line.total, 0);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const customer = customers.find(c => c.id === customerId);
            const salesOrderData = {
                id: salesOrder?.id,
                customerId,
                customerName: customer?.name || 'N/A',
                orderDate,
                status,
                lines,
                totalAmount: calculateTotalAmount(),
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
                    <Label className="flex items-center gap-2"><Hash className="h-4 w-4" /> Sales Order ID</Label>
                    <Input value={salesOrderId} disabled />
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
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Order Date</Label>
                    <DatePicker date={orderDate} setDate={setOrderDate} />
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Status</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as SalesOrder['status'])}>
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
                                <TableHead className="w-[30%]">Product</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>UOM</TableHead>
                                <TableHead>Unit Price</TableHead>
                                <TableHead>Discount (%)</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
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
                                        <Input type="number" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', Number(e.target.value))} className="w-20" />
                                    </TableCell>
                                     <TableCell>{line.uom}</TableCell>
                                    <TableCell>
                                        <Input type="number" value={line.unitPrice} onChange={e => handleLineChange(index, 'unitPrice', Number(e.target.value))} className="w-28" />
                                    </TableCell>
                                     <TableCell>
                                        <Input type="number" value={line.discount || 0} onChange={e => handleLineChange(index, 'discount', Number(e.target.value))} className="w-20" />
                                    </TableCell>
                                    <TableCell>₱{line.total.toFixed(2)}</TableCell>
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

            <div className="flex justify-end items-center gap-6 mt-4">
                <div className="text-right">
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">₱{calculateTotalAmount().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                 <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSaving ? 'Saving...' : (salesOrder ? 'Save Changes' : 'Create Sales Order')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
