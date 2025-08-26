
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Role } from '@/lib/types';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { navGroups } from '@/app/layout';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '../ui/table';
import { CheckCircle2, Eye, XCircle } from 'lucide-react';


interface RoleDetailsModalProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
}

const PermissionIcon = ({ permission }: { permission?: string }) => {
    if (permission === 'Full Access') {
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (permission === 'Read-only') {
        return <Eye className="h-5 w-5 text-blue-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
};


export default function RoleDetailsModal({
  role,
  isOpen,
  onClose,
}: RoleDetailsModalProps) {
  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Permissions for: {role.name}</DialogTitle>
          <DialogDescription>
            This is a read-only view of the permissions assigned to this role.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 pr-4">
            <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                        <TableHead>Module</TableHead>
                        <TableHead className="text-center">Permission</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {navGroups.map(group => (
                         <React.Fragment key={group.title}>
                            <TableRow className="bg-muted/50">
                                <TableCell colSpan={2} className="font-bold text-primary">{group.title}</TableCell>
                            </TableRow>
                            {group.items.map((item: any) => (
                                item.links.map((link: any) => (
                                    <TableRow key={link.label}>
                                        <TableCell className="font-medium pl-8">{link.label}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center">
                                                <PermissionIcon permission={role.permissions[link.label]} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ))}
                         </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
