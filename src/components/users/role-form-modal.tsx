
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
import { Loader2, Shield } from 'lucide-react';
import { Role, PermissionLevel } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Omit<Role, 'id'> & {id?: string}) => Promise<void>;
  role: Role | null;
  modules: string[];
}

const permissionLevels: PermissionLevel[] = ['Full Access', 'Read-only', 'No Access'];

export default function RoleFormModal({ 
    isOpen, 
    onClose, 
    onSave,
    role,
    modules,
}: RoleFormModalProps) {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState<{[key: string]: PermissionLevel}>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (role) {
                setName(role.name);
                setPermissions(role.permissions || {});
            } else {
                // Set default permissions for a new role
                const defaultPermissions = modules.reduce((acc, module) => {
                    acc[module] = 'No Access';
                    return acc;
                }, {} as {[key: string]: PermissionLevel});
                setPermissions(defaultPermissions);
                setName('');
            }
        }
    }, [isOpen, role, modules]);
    
    const handlePermissionChange = (module: string, level: PermissionLevel) => {
        setPermissions(prev => ({
            ...prev,
            [module]: level,
        }));
    }

    const handleSubmit = async () => {
        if (!name) {
            toast({ title: "Validation Error", description: "Role name is required.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        const roleData = {
            id: role?.id,
            name,
            permissions,
        };

        try {
            await onSave(roleData);
            onClose();
        } catch (error) {
            console.error("Failed to save role", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{role ? 'Edit Role' : 'Add New Role'}</DialogTitle>
                    <DialogDescription>
                        {role ? 'Update the details for this role.' : 'Define a new role and set its permissions.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-name" className="flex items-center gap-2"><Shield className="h-4 w-4 text-blue-500" /> Role Name</Label>
                        <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sales Staff" />
                    </div>
                    
                    <h3 className="font-semibold mt-4">Permissions</h3>
                    <ScrollArea className="h-72 pr-4 border rounded-md">
                        <div className="p-4 space-y-3">
                        {modules.map(module => (
                            <div key={module} className="flex items-center justify-between">
                                <Label htmlFor={`perm-${module}`}>{module}</Label>
                                <Select
                                    value={permissions[module] || 'No Access'}
                                    onValueChange={(value: PermissionLevel) => handlePermissionChange(module, value)}
                                >
                                    <SelectTrigger id={`perm-${module}`} className="w-[180px]">
                                        <SelectValue placeholder="Set permission" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {permissionLevels.map(level => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>

                </div>
                <DialogFooter>
                    <Button variant="cancel" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {role ? 'Save Changes' : 'Add Role'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
