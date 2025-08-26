
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Omit<Role, 'id'> & {id?: string}) => Promise<void>;
  role: Role | null;
  navGroups: any[];
}

const permissionLevels: PermissionLevel[] = ['Full Access', 'Read-only', 'No Access'];

export default function RoleFormModal({ 
    isOpen, 
    onClose, 
    onSave,
    role,
    navGroups,
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
                const defaultPermissions: {[key: string]: PermissionLevel} = {};
                navGroups.forEach(group => {
                    group.items.forEach((item: any) => {
                        defaultPermissions[item.title] = 'No Access';
                        item.links.forEach((link: any) => {
                            defaultPermissions[link.label] = 'No Access';
                        });
                    });
                });
                setPermissions(defaultPermissions);
                setName('');
            }
        }
    }, [isOpen, role, navGroups]);
    
    const handlePermissionChange = (module: string, level: PermissionLevel) => {
        setPermissions(prev => ({
            ...prev,
            [module]: level,
        }));
    }

    const handleGroupPermissionChange = (groupTitle: string, level: PermissionLevel) => {
        const newPermissions = { ...permissions };
        const group = navGroups.flatMap(g => g.items).find(i => i.title === groupTitle);
        if (group) {
            group.links.forEach((link: any) => {
                newPermissions[link.label] = level;
            });
        }
        setPermissions(newPermissions);
    };


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
                        <Accordion type="multiple" className="w-full p-2" defaultValue={navGroups.map(g => g.items.map((i:any) => i.title)).flat()}>
                        {navGroups.map(group => (
                            group.items.map((item: any) => (
                                <AccordionItem value={item.title} key={item.title}>
                                    <AccordionTrigger>
                                        <div className="flex items-center justify-between w-full pr-2">
                                            <span className="font-semibold text-sm">{item.title}</span>
                                            <RadioGroup 
                                                className="flex gap-x-4" 
                                                onValueChange={(value: PermissionLevel) => handleGroupPermissionChange(item.title, value)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {permissionLevels.map(level => (
                                                    <div key={level} className="flex items-center space-x-2">
                                                        <Label htmlFor={`perm-group-${item.title}-${level}`} className="text-xs">{level}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pl-4 space-y-3 pt-2">
                                            {item.links.map((link: any) => (
                                                 <div key={link.label} className="flex items-center justify-between">
                                                    <Label htmlFor={`perm-${link.label}`}>{link.label}</Label>
                                                    <RadioGroup 
                                                        value={permissions[link.label] || 'No Access'}
                                                        onValueChange={(value: PermissionLevel) => handlePermissionChange(link.label, value)}
                                                        className="flex gap-x-4"
                                                    >
                                                        {permissionLevels.map(level => (
                                                            <div key={level} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={level} id={`perm-${link.label}-${level}`} />
                                                                <Label htmlFor={`perm-${link.label}-${level}`} className="text-xs font-normal">{level}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))
                        ))}
                        </Accordion>
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
