
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, CreditCard } from 'lucide-react';
import type { Invoice, PaymentMethod } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '../ui/progress';
import Image from 'next/image';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceId: string, paymentMethod?: PaymentMethod, transactionProof?: string) => Promise<void>;
  invoice: Invoice;
}

const paymentMethods: PaymentMethod[] = ['Cash', 'Gcash', 'Maya', 'Credit Card', 'Bank Transfer'];

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function PaymentFormModal({ isOpen, onClose, onSave, invoice }: PaymentFormModalProps) {
    const { toast } = useToast();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>();
    const [transactionFile, setTransactionFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [transactionProofPreview, setTransactionProofPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({ title: "File too large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
                return;
            }
            if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
                 toast({ title: "Invalid File Type", description: "Please upload a JPG, PNG, or PDF file.", variant: "destructive" });
                return;
            }
            setTransactionFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTransactionProofPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeImage = () => {
        setTransactionFile(null);
        setTransactionProofPreview(null);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const dataUri = transactionFile ? await fileToDataUri(transactionFile) : undefined;
            await onSave(invoice.id, paymentMethod, dataUri);
        } catch (error) {
            toast({ title: "Error", description: "Failed to upload transaction proof.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleMarkAsPosted = async () => {
        setIsSaving(true);
        try {
            await onSave(invoice.id, undefined, undefined);
        } catch (error) {
            console.error("Error marking as posted:", error);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Record Payment for Invoice {invoice.id}</DialogTitle>
                    <DialogDescription>
                        Upload transaction proof and select a payment method.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="payment-method" className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-500" /> Payment Method</Label>
                        <Select onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} value={paymentMethod}>
                            <SelectTrigger id="payment-method">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map(method => (
                                    <SelectItem key={method} value={method}>{method}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="dropzone-file" className="flex items-center gap-2"><Upload className="h-4 w-4 text-green-500" /> Transaction Proof</Label>
                         {transactionProofPreview ? (
                             <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                <Image src={transactionProofPreview} alt="Transaction proof preview" layout="fill" objectFit="contain" data-ai-hint="receipt proof" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={removeImage}
                                    disabled={isSaving}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                             </div>
                         ) : (
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg ${isSaving ? 'cursor-not-allowed bg-muted/50' : 'cursor-pointer bg-muted hover:bg-muted/80'}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-primary" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG, or PDF (MAX. 5MB)</p>
                                    </div>
                                    <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/jpeg,image/png,application/pdf" disabled={isSaving} />
                                </label>
                            </div>
                         )}
                         {isSaving && <Progress value={100} className="w-full h-2 animate-pulse" />}
                    </div>
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" onClick={handleMarkAsPosted} disabled={isSaving}>Mark as Posted</Button>
                    <div className="flex gap-2">
                        <Button variant="cancel" onClick={onClose} disabled={isSaving}>Cancel</Button>
                        <Button type="submit" onClick={handleSubmit} disabled={isSaving || !paymentMethod || !transactionFile}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSaving ? 'Saving...' : 'Mark as Paid'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
