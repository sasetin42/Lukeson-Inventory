

'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PurchaseOrder, DocumentLine, Supplier, Product } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Truck, Calendar, Hash, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { DatePicker } from '../ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PurchaseOrderFormProps {
  purchaseOrder: PurchaseOrder | null;
  onSuccess: (purchaseOrderData: Omit<PurchaseOrder, 'id'> & {id?: string}) => void;
  onCancel: () => void;
}

export default function PurchaseOrderForm({ purchaseOrder, onSuccess, onCancel }: PurchaseOrderFormProps) {
    const { toast } = useToast();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [purchaseOrderId, setPurchaseOrderId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [orderDate, setOrderDate] = useState<Date | undefined>(new Date());
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | undefined>();
    const [status, setStatus] = useState<PurchaseOrder['status']>('Draft');
    const [lines, setLines] = useState<DocumentLine[]>([]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const suppliersRef = collection(db, 'suppliers');
                const productsRef = collection(db, 'products');
                
                const suppliersSnapshot = await getDocs(suppliersRef);
                const loadedSuppliers = suppliersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
                setSuppliers(loadedSuppliers);
                
                const productsSnapshot = await getDocs(productsRef);
                const loadedProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                setProducts(loadedProducts);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ title: "Error", description: "Failed to load suppliers and products.", variant: "destructive"});
            }
        };
        fetchData();
    }, [toast]);
    
    useEffect(() => {
        const generatePurchaseOrderId = async () => {
            const poRef = collection(db, 'purchaseOrders');
            const snapshot = await getDocs(poRef);
            const poCount = snapshot.size;
            const year = new Date().getFullYear();
            setPurchaseOrderId(`PO-${year}-${(poCount + 1).toString().padStart(4, '0')}`);
        };

        if (purchaseOrder) {
            setPurchaseOrderId(purchaseOrder.id || '');
            setSupplierId(purchaseOrder.supplierId || '');
            setOrderDate(purchaseOrder.orderDate ? (purchaseOrder.orderDate as any).toDate() : new Date());
            setExpectedDeliveryDate(purchaseOrder.expectedDeliveryDate ? (purchaseOrder.expectedDeliveryDate as any).toDate() : undefined);
            setStatus(purchaseOrder.status || 'Draft');
            setLines(purchaseOrder.lines || []);
        } else {
            generatePurchaseOrderId();
            setLines([]);
            setSupplierId('');
            setOrderDate(new Date());
            setExpectedDeliveryDate(undefined);
            setStatus('Draft');
        }
    }, [purchaseOrder]);
    
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
            vatType: 'VATable',
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
                newLines[index].unitPrice = product.price; // Or a specific cost price field if available
                newLines[index].uom = product.uom;
            }
        }
        
        // Recalculate total
        const line = newLines[index];
        const subtotal = line.quantity * line.unitPrice;
        const taxAmount = subtotal * line.taxRate;
        line.total = subtotal + taxAmount;

        setLines(newLines);
    };

    const calculateTotalAmount = () => {
        return lines.reduce((acc, line) => acc + line.total, 0);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const supplier = suppliers.find(s => s.id === supplierId);
            const purchaseOrderData = {
                id: purchaseOrder?.id || purchaseOrderId,
                supplierId,
                supplierName: supplier?.name || 'N/A',
                supplierEmail: supplier?.contact.email || '',
                orderDate,
                expectedDeliveryDate: expectedDeliveryDate || null,
                status,
                lines,
                totalAmount: calculateTotalAmount(),
            };
            onSuccess(purchaseOrderData as any);
        } catch (error) {
            console.error("Failed to save purchase order:", error);
            toast({ title: "Error", description: "Failed to save purchase order.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Hash className="h-4 w-4" /> PO ID</Label>
                    <Input value={purchaseOrderId} disabled />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Truck className="h-4 w-4" /> Supplier</Label>
                    <Select onValueChange={setSupplierId} value={supplierId}>
                        <SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger>
                        <SelectContent>
                            {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Order Date</Label>
                    <DatePicker date={orderDate} setDate={setOrderDate} />
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Expected Delivery</Label>
                    <DatePicker date={expectedDeliveryDate} setDate={setExpectedDeliveryDate} />
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
                                <TableHead>Cost</TableHead>
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
                        {isSaving ? 'Saving...' : (purchaseOrder ? 'Save Changes' : 'Create PO')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

    
