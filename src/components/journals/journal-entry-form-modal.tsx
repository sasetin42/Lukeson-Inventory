
'use client';

import { useEffect, useState } from 'react';
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
import { Loader2, Calendar, FileText, PlusCircle, Trash2 } from 'lucide-react';
import { JournalEntry, JournalEntryLine, Account } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '../ui/date-picker';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';


interface JournalEntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<JournalEntry, 'id'> & {id?: string}) => Promise<void>;
  entry: JournalEntry | null;
  accounts: Account[];
}

export default function JournalEntryFormModal({ isOpen, onClose, onSave, entry, accounts }: JournalEntryFormModalProps) {
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [description, setDescription] = useState('');
    const [lines, setLines] = useState<Partial<JournalEntryLine>[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (entry) {
                setDate(entry.date ? (entry.date as any).toDate() : new Date());
                setDescription(entry.description || '');
                setLines(entry.lines || []);
            } else {
                resetForm();
            }
        }
    }, [isOpen, entry]);

    const resetForm = () => {
        setDate(new Date());
        setDescription('');
        setLines([
            { accountId: '', debit: 0, credit: 0 },
            { accountId: '', debit: 0, credit: 0 },
        ]);
    };
    
    const handleSubmit = async () => {
        setIsSaving(true);
        
        const entryData = {
            id: entry?.id,
            date: date || new Date(),
            description,
            lines: lines as JournalEntryLine[],
        };

        try {
            await onSave(entryData);
        } catch (error) {
            console.error("Failed to save entry", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleLineChange = (index: number, field: keyof JournalEntryLine, value: any) => {
        const newLines = [...lines];
        const line = newLines[index];
        (line as any)[field] = value;
        if (field === 'debit' && Number(value) > 0) line.credit = 0;
        if (field === 'credit' && Number(value) > 0) line.debit = 0;
        setLines(newLines);
    }
    
    const handleAddLine = () => {
        setLines([...lines, { accountId: '', debit: 0, credit: 0 }]);
    }
    
    const handleRemoveLine = (index: number) => {
        const newLines = lines.filter((_, i) => i !== index);
        setLines(newLines);
    }
    
    const totalDebits = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredits = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    const difference = totalDebits - totalCredits;
    const isBalanced = Math.abs(difference) < 0.001;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{entry ? 'Edit Journal Entry' : 'New Journal Entry'}</DialogTitle>
                    <DialogDescription>
                       Manually record debits and credits to your accounts.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Date</Label>
                            <DatePicker date={date} setDate={setDate} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Description</Label>
                            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. To record monthly electricity bill" />
                        </div>
                    </div>
                    
                    <div className="border rounded-md mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-2/5">Account</TableHead>
                                    <TableHead className="w-1/4 text-right">Debit</TableHead>
                                    <TableHead className="w-1/4 text-right">Credit</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.map((line, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Select value={line.accountId} onValueChange={v => handleLineChange(index, 'accountId', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select Account"/></SelectTrigger>
                                                <SelectContent>
                                                    {accounts.sort((a,b) => a.code.localeCompare(b.code)).map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>
                                                            {acc.code} - {acc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={line.debit || ''} onChange={e => handleLineChange(index, 'debit', e.target.value)} className="text-right" placeholder="0.00"/>
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" value={line.credit || ''} onChange={e => handleLineChange(index, 'credit', e.target.value)} className="text-right" placeholder="0.00"/>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveLine(index)} disabled={lines.length <= 2}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <Button variant="outline" size="sm" onClick={handleAddLine} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Line
                    </Button>
                    <Separator className="my-4"/>
                    <div className="flex justify-end gap-8">
                        <div className="text-right">
                            <Label>Total Debits</Label>
                            <p className="font-bold text-lg">₱{totalDebits.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                        <div className="text-right">
                            <Label>Total Credits</Label>
                            <p className="font-bold text-lg">₱{totalCredits.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                        <div className="text-right">
                            <Label>Difference</Label>
                            <p className={`font-bold text-lg ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                ₱{difference.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="cancel" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving || !isBalanced}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {entry ? 'Save Changes' : 'Record Entry'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
