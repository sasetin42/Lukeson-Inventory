
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
import { Loader2, Briefcase, Hash, List, Milestone } from 'lucide-react';
import { Account, AccountType, AccountSubType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'> & {id?: string}) => Promise<void>;
  account: Account | null;
}

const accountTypes: AccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
const accountSubTypes: Record<AccountType, AccountSubType[]> = {
    'Asset': ['Current Asset', 'Fixed Asset', 'Inventory', 'Bank'],
    'Liability': ['Current Liability', 'Long-term Liability'],
    'Equity': ['Owner\'s Equity', 'Retained Earnings'],
    'Revenue': ['Sales', 'Other Income'],
    'Expense': ['Cost of Goods Sold', 'Operating Expense'],
};


export default function AccountFormModal({ isOpen, onClose, onSave, account }: AccountFormModalProps) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState<AccountType>('Asset');
    const [subType, setSubType] = useState<AccountSubType>('Current Asset');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (account) {
                setName(account.name || '');
                setCode(account.code || '');
                setType(account.type || 'Asset');
                setSubType(account.subType || 'Current Asset');
            } else {
                resetForm();
            }
        }
    }, [isOpen, account]);

    const resetForm = () => {
        setName('');
        setCode('');
        setType('Asset');
        setSubType('Current Asset');
    };
    
    const handleSubmit = async () => {
        if(!name || !code || !type || !subType) {
            toast({ title: "Missing Fields", description: "Please fill out all fields.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        const accountData = {
            id: account?.id,
            name,
            code,
            type,
            subType,
            balance: account?.balance || 0,
        };

        try {
            await onSave(accountData);
        } catch (error) {
            console.error("Failed to save account", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTypeChange = (newType: AccountType) => {
        setType(newType);
        setSubType(accountSubTypes[newType][0]);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{account ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                    <DialogDescription>
                        {account ? 'Update the details of this account.' : 'Enter the details for the new account.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="account-name" className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Account Name</Label>
                        <Input id="account-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cash on Hand" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="account-code" className="flex items-center gap-2"><Hash className="h-4 w-4" /> Account Code</Label>
                        <Input id="account-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 1010" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="account-type" className="flex items-center gap-2"><List className="h-4 w-4" /> Account Type</Label>
                            <Select value={type} onValueChange={(v) => handleTypeChange(v as AccountType)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {accountTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-subtype" className="flex items-center gap-2"><Milestone className="h-4 w-4" /> Account Sub-type</Label>
                            <Select value={subType} onValueChange={(v) => setSubType(v as AccountSubType)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {accountSubTypes[type].map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="cancel" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {account ? 'Save Changes' : 'Add Account'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
