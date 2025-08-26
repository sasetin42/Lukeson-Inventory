
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
import { Loader2, User as UserIcon, Mail, Shield, Activity, Key } from 'lucide-react';
import type { User, Role } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'> & { id?: string, password?: string }) => Promise<void>;
  user: User | null;
  roles: Role[];
}

const statuses: User['status'][] = ['active', 'inactive'];
const SUPER_ADMIN_UID = "7AP0JBOpAJQMpGX7ofDyATVxfk93";

export default function UserFormModal({ 
    isOpen, 
    onClose, 
    onSave,
    user,
    roles,
}: UserFormModalProps) {
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<User['role']>('Viewer');
    const [status, setStatus] = useState<User['status']>('active');
    const [isSaving, setIsSaving] = useState(false);

    const isSuperAdmin = user?.id === SUPER_ADMIN_UID;
    const canModify = !isSuperAdmin || (isSuperAdmin && currentUser?.id === SUPER_ADMIN_UID);
    const isEditingSelf = currentUser?.id === user?.id;

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setName(user.name || '');
                setEmail(user.email || '');
                setRole(user.role || 'Viewer');
                setStatus(user.status || 'active');
                setPassword('');
            } else {
                resetForm();
            }
        }
    }, [isOpen, user]);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRole('Viewer');
        setStatus('active');
    }
    
    const handleSubmit = async () => {
        setIsSaving(true);
        
        const userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'> & { id?: string, password?: string } = {
            id: user?.id,
            name,
            email,
            role,
            status,
        };

        if (password && !user) { // Only add password if it's a new user
            userData.password = password;
        }

        try {
            await onSave(userData);
        } catch (error) {
            console.error("Failed to save user", error);
            // The parent component will show the toast
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
                        <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Juan dela Cruz" disabled={!canModify} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-red-500" /> Email Address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. juan.delacruz@company.com" disabled={!!user} />
                    </div>
                    {!user && (
                        <div className="space-y-2">
                            <Label htmlFor="password"><Key className="h-4 w-4 inline-block mr-2" />Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a strong password" />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role" className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" /> Role</Label>
                            <Select value={role} onValueChange={(value) => setRole(value as User['role'])} disabled={isSuperAdmin && !isEditingSelf}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status" className="flex items-center gap-2"><Activity className="h-4 w-4 text-yellow-500" /> Status</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as User['status'])} disabled={isSuperAdmin && !isEditingSelf}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     {user && (
                        <p className="text-xs text-muted-foreground">To change a user's password, use the 'Forgot Password' link on the login page or have an administrator reset it through the Firebase console.</p>
                     )}
                </div>
                <DialogFooter>
                    <Button variant="cancel" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving || !canModify}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {user ? 'Save Changes' : 'Add User'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
