
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Eye, Shield, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Role } from "@/lib/types";
import { navGroups } from "@/app/layout";

export const permissionsData = navGroups.flatMap(group => 
    group.items.flatMap(item => 
        item.links.map(link => ({ module: link.label }))
    )
);

const PermissionIcon = ({ permission }: { permission?: string }) => {
    if (permission === 'Full Access') {
        return <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />;
    }
    if (permission === 'Read-only') {
        return <Eye className="h-5 w-5 text-blue-500 mx-auto" />;
    }
    if (permission === 'No Access' || !permission) {
        return <XCircle className="h-5 w-5 text-red-500 mx-auto" />;
    }
    return null;
};

interface RolesPermissionsProps {
    roles: Role[];
    onAddRole: () => void;
    onEditRole: (role: Role) => void;
    onDeleteRole: (roleId: string) => void;
}

export default function RolesPermissions({ roles, onAddRole, onEditRole, onDeleteRole }: RolesPermissionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-500" />
                <div>
                    <CardTitle>Roles & Permissions Matrix</CardTitle>
                    <CardDescription>
                    An overview of what each user role can access and do in the system.
                    </CardDescription>
                </div>
            </div>
            <Button onClick={onAddRole}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Role
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-1/4">Module</TableHead>
                {roles.map(role => (
                    <TableHead key={role.id} className="text-center w-1/4">
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary">{role.name}</Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditRole(role)}><Edit className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDeleteRole(role.id)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                        </div>
                    </TableHead>
                ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {navGroups.map((group) => (
                    <React.Fragment key={group.title}>
                        <TableRow className="bg-muted/50">
                            <TableCell colSpan={roles.length + 1} className="font-bold text-primary">{group.title}</TableCell>
                        </TableRow>
                        {group.items.map((item) => (
                            item.links.map(link => (
                                <TableRow key={link.label}>
                                    <TableCell className="font-medium pl-8">{link.label}</TableCell>
                                    {roles.map(role => (
                                    <TableCell key={`${role.id}-${link.label}`} className="text-center">
                                        <PermissionIcon permission={role.permissions[link.label]} />
                                    </TableCell> 
                                    ))}
                                </TableRow>
                            ))
                        ))}
                    </React.Fragment>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Dummy export to keep other files working
export const permissionsDataBackup = [
  { module: 'Dashboard', admin: 'Full Access', manager: 'Full Access', viewer: 'Read-only' },
];

