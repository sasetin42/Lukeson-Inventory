
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Quotation, DocumentLine, Customer, Product } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Loader2, User, Calendar, Hash, FileText, PlusCircle, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { DatePicker } from '../ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

interface QuotationFormProps {
  quotation: Quotation | null;
  onSuccess: (quotationData: Omit<Quotation, 'id'> & {id?: string}) => void;
  onCancel: () => void;
  onIdGenerated: (id: string) => void;
}

export default function QuotationForm({ quotation, onSuccess, onCancel, onIdGenerated }: QuotationFormProps) {
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [quotationId, setQuotationId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [qtnDate, setQtnDate] = useState<Date | undefined>(new Date());
    const [expiryDate, setExpiryDate] = useState<Date | undefined>();
    const [status, setStatus] = useState<Quotation['status']>('Draft');
    const [lines, setLines] = useState<DocumentLine[]>([]);
    const [notes, setNotes] = useState('');
    
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
        const generateQuotationId = async () => {
            const quotationsRef = collection(db, 'quotations');
            const snapshot = await getDocs(quotationsRef);
            const quotationsCount = snapshot.size;
            const year = new Date().getFullYear();
            const newId = `QTN-${year}-${(quotationsCount + 1).toString().padStart(4, '0')}`;
            setQuotationId(newId);
            onIdGenerated(newId);
        };

        if (quotation) {
            const id = quotation.id || '';
            setQuotationId(id);
            onIdGenerated(id);
            setCustomerId(quotation.customerId || '');
            setQtnDate(quotation.qtnDate ? (quotation.qtnDate as any).toDate() : new Date());
            setExpiryDate(quotation.expiryDate ? (quotation.expiryDate as any).toDate() : undefined);
            setStatus(quotation.status || 'Draft');
            setLines(quotation.lines || []);
            setNotes(quotation.notes || '');
        } else {
            generateQuotationId();
            const defaultExpiry = new Date();
            defaultExpiry.setDate(defaultExpiry.getDate() + 30);
            setExpiryDate(defaultExpiry);
            setLines([]);
            setNotes('');
        }
    }, [quotation, onIdGenerated]);
    
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
            vatType: 'VATable'
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
        const taxableAmount = subtotal;
        const taxAmount = taxableAmount * line.taxRate;
        line.total = taxableAmount + taxAmount;

        setLines(newLines);
    };

    const calculateTotalAmount = () => {
        return lines.reduce((acc, line) => acc + line.total, 0);
    };

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

        setIsSaving(true);
        try {
            const customer = customers.find(c => c.id === customerId);
            const quotationData = {
                id: quotation?.id || quotationId,
                customerId,
                customerName: customer?.name || 'N/A',
                qtnDate,
                expiryDate,
                status,
                lines,
                notes,
                totalAmount: calculateTotalAmount(),
            };
            onSuccess(quotationData);
        } catch (error) {
            console.error("Failed to save quotation:", error);
            toast({ title: "Error", description: "Failed to save quotation.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><User className="h-4 w-4" /> Customer <span className="text-red-500">*</span></Label>
                    <Select onValueChange={setCustomerId} value={customerId}>
                        <SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger>
                        <SelectContent>
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Quotation Date</Label>
                    <DatePicker date={qtnDate} setDate={setQtnDate} />
                </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Expiry Date</Label>
                    <DatePicker date={expiryDate} setDate={setExpiryDate} />
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
                                <TableHead>Available</TableHead>
                                <TableHead>Unit Price</TableHead>
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
                                        {products.find(p => p.id === line.itemId)?.stock ?? 'N/A'}
                                     </TableCell>
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

            <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes for the customer..."/>
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
                        {isSaving ? 'Saving...' : (quotation ? 'Save Changes' : 'Create Quotation')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
