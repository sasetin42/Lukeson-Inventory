
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
import { Loader2, User as UserIcon, Mail, Shield, Activity } from 'lucide-react';
import type { User } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'> & { id?: string }) => Promise<void>;
  user: User | null;
}

const roles: User['role'][] = ['Admin', 'Inventory Manager', 'Sales', 'Purchasing', 'Finance', 'Auditor'];
const statuses: User['status'][] = ['active', 'inactive'];

export default function UserFormModal({ 
    isOpen, 
    onClose, 
    onSave,
    user,
}: UserFormModalProps) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<User['role']>('Sales');
    const [status, setStatus] = useState<User['status']>('active');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setName(user.name || '');
                setEmail(user.email || '');
                setRole(user.role || 'Sales');
                setStatus(user.status || 'active');
            } else {
                resetForm();
            }
        }
    }, [isOpen, user]);

    const resetForm = () => {
        setName('');
        setEmail('');
        setRole('Sales');
        setStatus('active');
    }
    
    const handleSubmit = async () => {
        if (!name || !email) {
            toast({ title: "Validation Error", description: "Name and Email are required.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        
        const userData = {
            id: user?.id,
            name,
            email,
            role,
            status,
        };

        try {
            await onSave(userData);
        } catch (error) {
            console.error("Failed to save user", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                        {user ? 'Update the details for this user.' : 'Enter the details for the new user.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="user-name" className="flex items-center gap-2"><UserIcon className="h-4 w-4 text-blue-500" /> Full Name</Label>
                        <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Juan dela Cruz" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-red-500" /> Email Address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. juan.delacruz@company.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role" className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" /> Role</Label>
                            <Select value={role} onValueChange={(value) => setRole(value as User['role'])}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status" className="flex items-center gap-2"><Activity className="h-4 w-4 text-yellow-500" /> Status</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as User['status'])}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {user ? 'Save Changes' : 'Add User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
